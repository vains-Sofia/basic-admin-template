export type AnyFn = (...args: any[]) => any

export interface Debounced<T extends AnyFn> {
	(...args: Parameters<T>): ReturnType<T> | void
	cancel: () => void
	flush: () => void
	original: T
}

/**
 * 防抖函数
 * @param fn        原始函数
 * @param wait      延迟时间（ms）
 * @param immediate 是否立即执行
 */
export function debounce<T extends AnyFn>(fn: T, wait = 300, immediate = false): Debounced<T> {
	let timer: ReturnType<typeof setTimeout> | null = null
	let lastArgs: any
	let lastThis: any
	let result: any

	const debounced = function (this: any, ...args: any[]) {
		lastArgs = args
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		lastThis = this

		const later = () => {
			timer = null
			if (!immediate) {
				result = fn.apply(lastThis, lastArgs)
				lastArgs = lastThis = null
			}
		}

		const callNow = immediate && !timer

		if (timer) clearTimeout(timer)
		timer = setTimeout(later, wait)

		if (callNow) {
			result = fn.apply(lastThis, lastArgs)
			lastArgs = lastThis = null
		}

		return result
	} as Debounced<T>

	debounced.cancel = () => {
		if (timer) {
			clearTimeout(timer)
			timer = null
		}
		lastArgs = lastThis = null
	}

	debounced.flush = () => {
		if (timer && lastArgs) {
			clearTimeout(timer)
			result = fn.apply(lastThis, lastArgs)
			timer = null
			lastArgs = lastThis = null
		}
	}

	debounced.original = fn

	return debounced
}
