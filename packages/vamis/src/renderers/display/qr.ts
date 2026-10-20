/** Byte-mode QR encoder (versions 1–10, ECC L/M/Q/H). Outputs a module matrix for SVG. */

const EXP = new Uint8Array(512)
const LOG = new Uint8Array(256)

;(() => {
  let x = 1
  for (let i = 0; i < 255; i++) {
    EXP[i] = x
    LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]
})()

function gfMul(a: number, b: number) {
  if (a === 0 || b === 0) return 0
  return EXP[LOG[a] + LOG[b]]
}

function rsGenerator(degree: number) {
  let poly = [1]
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0)
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j]
      next[j + 1] ^= gfMul(poly[j], EXP[i])
    }
    poly = next
  }
  return poly
}

function rsEncode(data: number[], ecCount: number) {
  const gen = rsGenerator(ecCount)
  const res = data.concat(new Array(ecCount).fill(0))
  for (let i = 0; i < data.length; i++) {
    const factor = res[i]
    if (!factor) continue
    for (let j = 0; j < gen.length; j++) res[i + j] ^= gfMul(gen[j], factor)
  }
  return res.slice(data.length)
}

/** [n1, total1, data1, n2?, total2?, data2?] per version 1–10 × L/M/Q/H */
const RS_BLOCKS = [
  [1, 26, 19],
  [1, 26, 16],
  [1, 26, 13],
  [1, 26, 9],
  [1, 44, 34],
  [1, 44, 28],
  [1, 44, 22],
  [1, 44, 16],
  [1, 70, 55],
  [1, 70, 44],
  [2, 35, 17],
  [2, 35, 13],
  [1, 100, 80],
  [2, 50, 32],
  [2, 50, 24],
  [4, 25, 9],
  [1, 134, 108],
  [2, 67, 43],
  [2, 33, 15, 2, 34, 16],
  [2, 33, 11, 2, 34, 12],
  [2, 86, 68],
  [4, 43, 27],
  [4, 43, 19],
  [4, 43, 15],
  [2, 98, 78],
  [4, 49, 31],
  [2, 32, 14, 4, 33, 15],
  [4, 39, 13, 1, 40, 14],
  [2, 121, 97],
  [2, 60, 38, 2, 61, 39],
  [4, 40, 18, 2, 41, 19],
  [4, 40, 14, 2, 41, 15],
  [2, 146, 116],
  [3, 58, 36, 2, 59, 37],
  [4, 36, 16, 4, 37, 17],
  [4, 36, 12, 4, 37, 13],
  [2, 86, 68, 2, 87, 69],
  [4, 69, 43, 1, 70, 44],
  [6, 43, 19, 2, 44, 20],
  [6, 43, 15, 2, 44, 16],
]

const ALIGN = [
  [],
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
]

const REMAINDER = [0, 0, 7, 7, 7, 7, 7, 0, 0, 0, 0]
const ECC_INDEX = { L: 0, M: 1, Q: 2, H: 3 } as const
const ECC_FORMAT = { L: 1, M: 0, Q: 3, H: 2 } as const

export type QrLevel = keyof typeof ECC_INDEX

function blocksOf(version: number, level: QrLevel) {
  const row = RS_BLOCKS[(version - 1) * 4 + ECC_INDEX[level]]
  const groups: { count: number; total: number; data: number }[] = [
    { count: row[0], total: row[1], data: row[2] },
  ]
  if (row.length > 3) groups.push({ count: row[3], total: row[4], data: row[5] })
  return groups
}

function dataCapacity(version: number, level: QrLevel) {
  return blocksOf(version, level).reduce((sum, g) => sum + g.count * g.data, 0)
}

class BitBuf {
  bits: number[] = []
  put(value: number, len: number) {
    for (let i = len - 1; i >= 0; i--) this.bits.push((value >>> i) & 1)
  }
  toBytes() {
    const out: number[] = []
    for (let i = 0; i < this.bits.length; i += 8) {
      let b = 0
      for (let j = 0; j < 8; j++) b = (b << 1) | (this.bits[i + j] || 0)
      out.push(b)
    }
    return out
  }
}

function encodeData(bytes: number[], version: number, level: QrLevel) {
  const cap = dataCapacity(version, level)
  const countBits = version <= 9 ? 8 : 16
  const buf = new BitBuf()
  buf.put(0b0100, 4)
  buf.put(bytes.length, countBits)
  for (const b of bytes) buf.put(b, 8)
  const maxBits = cap * 8
  const term = Math.min(4, maxBits - buf.bits.length)
  if (term > 0) buf.put(0, term)
  while (buf.bits.length % 8) buf.bits.push(0)
  const data = buf.toBytes()
  const pads = [0xec, 0x11]
  let p = 0
  while (data.length < cap) data.push(pads[p++ % 2])
  return data.slice(0, cap)
}

function interleave(data: number[], version: number, level: QrLevel) {
  const groups = blocksOf(version, level)
  const blocks: { data: number[]; ecc: number[] }[] = []
  let offset = 0
  for (const g of groups) {
    const ec = g.total - g.data
    for (let i = 0; i < g.count; i++) {
      const slice = data.slice(offset, offset + g.data)
      offset += g.data
      blocks.push({ data: slice, ecc: rsEncode(slice, ec) })
    }
  }
  const out: number[] = []
  const maxData = Math.max(...blocks.map((b) => b.data.length))
  const maxEcc = Math.max(...blocks.map((b) => b.ecc.length))
  for (let i = 0; i < maxData; i++) {
    for (const b of blocks) if (i < b.data.length) out.push(b.data[i])
  }
  for (let i = 0; i < maxEcc; i++) {
    for (const b of blocks) if (i < b.ecc.length) out.push(b.ecc[i])
  }
  return out
}

function bitAt(data: number[], i: number) {
  return (data[i >> 3] >>> (7 - (i & 7))) & 1
}

function formatBits(level: QrLevel, mask: number) {
  let data = (ECC_FORMAT[level] << 3) | mask
  let rem = data << 10
  for (let i = 14; i >= 10; i--) {
    if ((rem >>> i) & 1) rem ^= 0x537 << (i - 10)
  }
  return ((data << 10) | rem) ^ 0x5412
}

function versionBits(version: number) {
  let rem = version << 12
  for (let i = 17; i >= 12; i--) {
    if ((rem >>> i) & 1) rem ^= 0x1f25 << (i - 12)
  }
  return (version << 12) | rem
}

function maskBit(mask: number, r: number, c: number) {
  switch (mask) {
    case 0:
      return (r + c) % 2 === 0
    case 1:
      return r % 2 === 0
    case 2:
      return c % 3 === 0
    case 3:
      return (r + c) % 3 === 0
    case 4:
      return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0
    case 5:
      return ((r * c) % 2) + ((r * c) % 3) === 0
    case 6:
      return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0
    default:
      return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0
  }
}

function matrix(n: number, fill = false) {
  return Array.from({ length: n }, () => new Array<boolean>(n).fill(fill))
}

function placeFinder(mod: boolean[][], fn: boolean[][], x: number, y: number) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const rr = y + r
      const cc = x + c
      if (rr < 0 || cc < 0 || rr >= mod.length || cc >= mod.length) continue
      const on = r >= 0 && r <= 6 && c >= 0 && c <= 6 && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4))
      mod[rr][cc] = on
      fn[rr][cc] = true
    }
  }
}

function placeAlign(mod: boolean[][], fn: boolean[][], cx: number, cy: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const on = Math.max(Math.abs(r), Math.abs(c)) !== 1
      mod[cy + r][cx + c] = on
      fn[cy + r][cx + c] = true
    }
  }
}

function reserveFormat(fn: boolean[][]) {
  const n = fn.length
  for (let i = 0; i < 9; i++) {
    fn[8][i] = true
    fn[i][8] = true
  }
  for (let i = 0; i < 8; i++) {
    fn[8][n - 1 - i] = true
    fn[n - 1 - i][8] = true
  }
  fn[8][n - 8] = true
}

function drawFormat(mod: boolean[][], bits: number, dark: boolean) {
  const n = mod.length
  const get = (i: number) => ((bits >>> i) & 1) === 1
  for (let i = 0; i <= 5; i++) mod[i][8] = get(i)
  mod[7][8] = get(6)
  mod[8][8] = get(7)
  mod[8][7] = get(8)
  for (let i = 9; i < 15; i++) mod[8][14 - i] = get(i)
  for (let i = 0; i < 8; i++) mod[n - 1 - i][8] = get(i)
  for (let i = 8; i < 15; i++) mod[8][n - 15 + i] = get(i)
  mod[n - 8][8] = dark
}

function drawVersion(mod: boolean[][], fn: boolean[][], version: number) {
  if (version < 7) return
  const bits = versionBits(version)
  const n = mod.length
  for (let i = 0; i < 18; i++) {
    const on = ((bits >>> i) & 1) === 1
    const r = Math.floor(i / 3)
    const c = i % 3
    mod[r][n - 11 + c] = on
    fn[r][n - 11 + c] = true
    mod[n - 11 + c][r] = on
    fn[n - 11 + c][r] = true
  }
}

function buildFunction(version: number) {
  const n = 21 + 4 * (version - 1)
  const mod = matrix(n)
  const fn = matrix(n)
  placeFinder(mod, fn, 0, 0)
  placeFinder(mod, fn, n - 7, 0)
  placeFinder(mod, fn, 0, n - 7)
  for (const y of ALIGN[version]) {
    for (const x of ALIGN[version]) {
      if ((x === 6 && y === 6) || (x === 6 && y === n - 7) || (x === n - 7 && y === 6)) continue
      placeAlign(mod, fn, x, y)
    }
  }
  for (let i = 8; i < n - 8; i++) {
    const on = i % 2 === 0
    if (!fn[6][i]) {
      mod[6][i] = on
      fn[6][i] = true
    }
    if (!fn[i][6]) {
      mod[i][6] = on
      fn[i][6] = true
    }
  }
  reserveFormat(fn)
  drawVersion(mod, fn, version)
  mod[n - 8][8] = true
  fn[n - 8][8] = true
  return { mod, fn }
}

function placeData(mod: boolean[][], fn: boolean[][], data: number[], remainder: number) {
  const n = mod.length
  let i = 0
  const total = data.length * 8 + remainder
  for (let right = n - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    for (let vert = 0; vert < n; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const upward = ((right + 1) & 2) === 0
        const y = upward ? n - 1 - vert : vert
        if (fn[y][x]) continue
        mod[y][x] = i < data.length * 8 ? bitAt(data, i) === 1 : false
        i++
        if (i >= total && i >= data.length * 8) {
          /* remainder zeros already written when i exceeds data bits */
        }
      }
    }
  }
}

function applyMask(mod: boolean[][], fn: boolean[][], mask: number) {
  const n = mod.length
  const next = mod.map((row) => row.slice())
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!fn[r][c] && maskBit(mask, r, c)) next[r][c] = !next[r][c]
    }
  }
  return next
}

function penalty(mod: boolean[][]) {
  const n = mod.length
  let score = 0
  for (let r = 0; r < n; r++) {
    let run = 1
    for (let c = 1; c <= n; c++) {
      if (c < n && mod[r][c] === mod[r][c - 1]) run++
      else {
        if (run >= 5) score += 3 + (run - 5)
        run = 1
      }
    }
  }
  for (let c = 0; c < n; c++) {
    let run = 1
    for (let r = 1; r <= n; r++) {
      if (r < n && mod[r][c] === mod[r - 1][c]) run++
      else {
        if (run >= 5) score += 3 + (run - 5)
        run = 1
      }
    }
  }
  for (let r = 0; r < n - 1; r++) {
    for (let c = 0; c < n - 1; c++) {
      const v = mod[r][c]
      if (v === mod[r][c + 1] && v === mod[r + 1][c] && v === mod[r + 1][c + 1]) score += 3
    }
  }
  const finder = [true, false, true, true, true, false, true]
  const has = (row: boolean[], start: number) => finder.every((v, i) => row[start + i] === v)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c <= n - 7; c++) {
      if (!has(mod[r], c)) continue
      if (c >= 4 && !mod[r][c - 1] && !mod[r][c - 2] && !mod[r][c - 3] && !mod[r][c - 4]) score += 40
      if (c + 10 < n && !mod[r][c + 7] && !mod[r][c + 8] && !mod[r][c + 9] && !mod[r][c + 10]) score += 40
    }
  }
  for (let c = 0; c < n; c++) {
    const col = mod.map((row) => row[c])
    for (let r = 0; r <= n - 7; r++) {
      if (!has(col, r)) continue
      if (r >= 4 && !col[r - 1] && !col[r - 2] && !col[r - 3] && !col[r - 4]) score += 40
      if (r + 10 < n && !col[r + 7] && !col[r + 8] && !col[r + 9] && !col[r + 10]) score += 40
    }
  }
  let dark = 0
  for (const row of mod) for (const cell of row) if (cell) dark++
  const k = Math.floor(Math.abs((dark * 100) / (n * n) - 50) / 5)
  score += k * 10
  return score
}

export function encodeQr(text: string, level: QrLevel = 'L'): boolean[][] | null {
  const bytes = Array.from(new TextEncoder().encode(text))
  if (!bytes.length) return null
  let version = 0
  for (let v = 1; v <= 10; v++) {
    const countBits = v <= 9 ? 8 : 16
    const need = Math.ceil((4 + countBits + bytes.length * 8 + 4) / 8)
    if (need <= dataCapacity(v, level)) {
      version = v
      break
    }
  }
  if (!version) return null
  const data = interleave(encodeData(bytes, version, level), version, level)
  const { mod, fn } = buildFunction(version)
  placeData(mod, fn, data, REMAINDER[version])
  let best = applyMask(mod, fn, 0)
  drawFormat(best, formatBits(level, 0), true)
  let bestScore = penalty(best)
  for (let mask = 1; mask < 8; mask++) {
    const candidate = applyMask(mod, fn, mask)
    drawFormat(candidate, formatBits(level, mask), true)
    const score = penalty(candidate)
    if (score < bestScore) {
      best = candidate
      bestScore = score
    }
  }
  return best
}

export function qrPath(modules: boolean[][]) {
  let d = ''
  for (let y = 0; y < modules.length; y++) {
    for (let x = 0; x < modules[y].length; x++) {
      if (modules[y][x]) d += `M${x} ${y}h1v1h-1z`
    }
  }
  return d
}
