/** Code 128B / Code 39 SVG barcode encoders. */

const C128 = [
  '11011001100',
  '11001101100',
  '11001100110',
  '10010011000',
  '10010001100',
  '10001001100',
  '10011001000',
  '10011000100',
  '10001100100',
  '11001001000',
  '11001000100',
  '11000100100',
  '10110011100',
  '10011011100',
  '10011001110',
  '10111001100',
  '10011101100',
  '10011100110',
  '11001110010',
  '11001011100',
  '11001001110',
  '11011100100',
  '11001110100',
  '11101101110',
  '11101001100',
  '11100101100',
  '11100100110',
  '11101100100',
  '11100110100',
  '11100110010',
  '11011011000',
  '11011000110',
  '11000110110',
  '10100011000',
  '10001011000',
  '10001000110',
  '10110001000',
  '10001101000',
  '10001100010',
  '11010001000',
  '11000101000',
  '11000100010',
  '10110111000',
  '10110001110',
  '10001101110',
  '10111011000',
  '10111000110',
  '10001110110',
  '11101110110',
  '11010001110',
  '11000101110',
  '11011101000',
  '11011100010',
  '11011101110',
  '11101011000',
  '11101000110',
  '11100010110',
  '11101101000',
  '11101100010',
  '11100011010',
  '11101111010',
  '11001000010',
  '11110001010',
  '10100110000',
  '10100001100',
  '10010110000',
  '10010000110',
  '10000101100',
  '10000100110',
  '10110010000',
  '10110000100',
  '10011010000',
  '10011000010',
  '10000110100',
  '10000110010',
  '11000010010',
  '11001010000',
  '11110111010',
  '11000010100',
  '10001111010',
  '10100111100',
  '10010111100',
  '10010011110',
  '10111100100',
  '10011110100',
  '10011110010',
  '11110100100',
  '11110010100',
  '11110010010',
  '11011011110',
  '11011110110',
  '11110110110',
  '10101111000',
  '10100011110',
  '10001011110',
  '10111101000',
  '10111100010',
  '11110101000',
  '11110100010',
  '10111011110',
  '10111101110',
  '11101011110',
  '11110101110',
  '11010000100',
  '11010010000',
  '11010011100',
  '1100011101011',
]

const C39: Record<string, string> = {
  '0': 'nnnwwnwnn',
  '1': 'wnnwnnnnw',
  '2': 'nnwwnnnnw',
  '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw',
  '5': 'wnnwwnnnn',
  '6': 'nnwwwnnnn',
  '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn',
  '9': 'nnwwnnwnn',
  A: 'wnnnnwnnw',
  B: 'nnwnnwnnw',
  C: 'wnwnnwnnn',
  D: 'nnnnwwnnw',
  E: 'wnnnwwnnn',
  F: 'nnwnwwnnn',
  G: 'nnnnnwwnw',
  H: 'wnnnnwwnn',
  I: 'nnwnnwwnn',
  J: 'nnnnwwwnn',
  K: 'wnnnnnnww',
  L: 'nnwnnnnww',
  M: 'wnwnnnnwn',
  N: 'nnnnwnnww',
  O: 'wnnnwnnwn',
  P: 'nnwnwnnwn',
  Q: 'nnnnnnwww',
  R: 'wnnnnnwwn',
  S: 'nnwnnnwwn',
  T: 'nnnnwnwwn',
  U: 'wwnnnnnnw',
  V: 'nwwnnnnnw',
  W: 'wwwnnnnnn',
  X: 'nwnnwnnnw',
  Y: 'wwnnwnnnn',
  Z: 'nwwnwnnnn',
  '-': 'nwnnnnwnw',
  '.': 'wwnnnnwnn',
  ' ': 'nwwnnnwnn',
  $: 'nwnwnwnnn',
  '/': 'nwnwnnnwn',
  '+': 'nwnnnwnwn',
  '%': 'nnnwnwnwn',
  '*': 'nwnnwnwnn',
}

export type BarcodeOptions = {
  format?: string
  width?: number
  height?: number
  lineColor?: string
  background?: string
  displayValue?: boolean
}

export type BarcodeSvg = {
  svg: string
  width: number
  height: number
}

function barsToSvg(pattern: string, opts: BarcodeOptions, text: string): BarcodeSvg {
  const module = Math.max(1, Number(opts.width) || 2)
  const barH = Math.max(20, Number(opts.height) || 80)
  const showText = opts.displayValue !== false
  const textH = showText ? 16 : 0
  const width = pattern.length * module
  const height = barH + textH + (showText ? 4 : 0)
  const fg = opts.lineColor || '#111827'
  const bg = opts.background || '#ffffff'
  const rects: string[] = []
  let x = 0
  let run = 0
  let on = pattern[0] === '1'
  for (let i = 0; i <= pattern.length; i++) {
    const bit = pattern[i] === '1'
    if (i < pattern.length && bit === on) {
      run++
      continue
    }
    if (on && run) {
      rects.push(`<rect x="${x}" y="0" width="${run * module}" height="${barH}" fill="${fg}"/>`)
    }
    x += run * module
    run = 1
    on = bit
  }
  const label = showText
    ? `<text x="${width / 2}" y="${barH + 14}" text-anchor="middle" font-size="12" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" fill="${fg}">${escapeXml(text)}</text>`
    : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(text)}"><rect width="${width}" height="${height}" fill="${bg}"/>${rects.join('')}${label}</svg>`
  return { svg, width, height }
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] || ch)
}

function encodeCode128(text: string) {
  const START_B = 104
  const STOP = 106
  const codes = [START_B]
  for (const ch of text) {
    const code = ch.charCodeAt(0) - 32
    if (code < 0 || code > 95) return null
    codes.push(code)
  }
  let sum = START_B
  codes.slice(1).forEach((code, i) => {
    sum += code * (i + 1)
  })
  codes.push(sum % 103, STOP)
  return codes.map((c) => C128[c]).join('')
}

function encodeCode39(text: string) {
  const body = `*${text.toUpperCase()}*`
  const parts: string[] = []
  for (const ch of body) {
    const pat = C39[ch]
    if (!pat) return null
    let bits = ''
    for (let i = 0; i < pat.length; i++) {
      const wide = pat[i] === 'w'
      const bar = i % 2 === 0
      bits += (bar ? '1' : '0').repeat(wide ? 3 : 1)
    }
    parts.push(bits)
  }
  return parts.join('0')
}

export function encodeBarcode(text: string, options: BarcodeOptions = {}): BarcodeSvg | null {
  if (!text) return null
  const format = String(options.format || 'CODE128').toUpperCase().replace(/[-_]/g, '')
  const pattern = format.includes('39') ? encodeCode39(text) : encodeCode128(text)
  if (!pattern) return null
  return barsToSvg(pattern, options, text)
}
