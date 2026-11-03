import { createRequire } from 'node:module'
import path from 'node:path'

/**
 * SDK / Playground 把 workspace 包 alias 到源码后，Rollup 从自身 package 上下文解析。
 * pnpm 不提升 dayjs 等到根 node_modules，这里按声明依赖的包再 resolve 一次。
 */
export function workspaceBareResolve(repo, extraDirs = []) {
  const dirs = [
    path.join(repo, 'packages/vamis-sdk'),
    path.join(repo, 'packages/vamis'),
    path.join(repo, 'packages/vamis-core'),
    path.join(repo, 'packages/vamis-formula'),
    path.join(repo, 'packages/vamis-ui'),
    ...extraDirs,
  ]
  const resolvers = dirs.map((dir) => {
    try {
      return createRequire(path.join(dir, 'package.json'))
    } catch {
      return null
    }
  }).filter(Boolean)

  return {
    name: 'vamis-workspace-bare-resolve',
    resolveId(id) {
      if (
        !id ||
        id.startsWith('\0') ||
        id.startsWith('.') ||
        id.startsWith('/') ||
        path.isAbsolute(id) ||
        id.startsWith('@vamis/') ||
        id === 'vamis' ||
        id.startsWith('virtual:') ||
        id.startsWith('@/')
      ) {
        return null
      }
      for (const req of resolvers) {
        try {
          return req.resolve(id)
        } catch {
          /* try next workspace package */
        }
      }
      return null
    },
  }
}
