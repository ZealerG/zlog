/**
 * 轻量运行时性能监控。
 *
 * 只在开发模式(NODE_ENV=development)或 DEBUG_CONTENT=1 时统计关键耗时,
 * 避免生产环境任何开销。输出到 stderr,便于 dev server 观察。
 */

const enabled =
  process.env.NODE_ENV === "development" ||
  process.env.DEBUG_CONTENT === "1"

export function perfEnabled(): boolean {
  return enabled
}

/** 测量一个同步函数耗时并可选输出。 */
export function measureSync<T>(
  label: string,
  fn: () => T,
  opts: { log?: boolean } = {},
): T {
  if (!enabled) return fn()
  const start = performance.now()
  const result = fn()
  const ms = performance.now() - start
  if (opts.log !== false) {
    console.log(`[perf] ${label}: ${ms.toFixed(1)}ms`)
  }
  return result
}

/** 测量一个异步函数耗时并可选输出。 */
export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>,
  opts: { log?: boolean } = {},
): Promise<T> {
  if (!enabled) return fn()
  const start = performance.now()
  const result = await fn()
  const ms = performance.now() - start
  if (opts.log !== false) {
    console.log(`[perf] ${label}: ${ms.toFixed(1)}ms`)
  }
  return result
}

/** 返回一个可手动结束的计时器(用于缓存命中/未命中分支统计)。 */
export function startTimer(label: string): { end: () => void } {
  if (!enabled) return { end: () => {} }
  const start = performance.now()
  return {
    end: () => {
      const ms = performance.now() - start
      console.log(`[perf] ${label}: ${ms.toFixed(1)}ms`)
    },
  }
}