export interface DebounceOptions {
	wait?: number;             // 防抖延迟，默认 300ms
	leading?: boolean;         // 是否在开始时立即触发，默认 false
	trailing?: boolean;        // 是否在结束时触发，默认 true
	maxWait?: number;          // 可选：最大等待时间
}

export interface DebouncedFunction<T extends (...args: any[]) => any> {
	(...args: Parameters<T>): ReturnType<T> | undefined;
	cancel: () => void;
	flush: () => ReturnType<T> | undefined;
}

export function useDebounce<T extends (...args: any[]) => any>(
	fn: T,
	wait = 300,
	options: DebounceOptions = {}
): DebouncedFunction<T> {
	const {
		leading = false,
		trailing = true,
		maxWait
	} = options

	let timerId: ReturnType<typeof setTimeout> | null = null
	let lastCallTime: number | null = null
	let lastInvokeTime: number = 0
	let lastArgs: Parameters<T> | null = null
	let lastThis: any = null
	let result: ReturnType<T> | undefined

	// 检查是否应该调用函数
	const shouldInvoke = (time: number): boolean => {
		if (lastCallTime === null) return true

		const timeSinceLastCall = time - lastCallTime
		const timeSinceLastInvoke = time - lastInvokeTime

		// 超过等待时间或者有最大等待时间且超过最大等待时间
		return (
			timeSinceLastCall >= wait ||
			(maxWait !== undefined && timeSinceLastInvoke >= maxWait)
		)
	}

	// 执行函数
	const invokeFunc = (time: number): ReturnType<T> | undefined => {
		const args = lastArgs
		const thisArg = lastThis

		lastArgs = null
		lastThis = null
		lastInvokeTime = time
		result = fn.apply(thisArg, args as any)
		return result
	}

	// 开始计时
	const startTimer = (pendingFunc: () => void, waitTime: number) => {
		if (timerId) {
			clearTimeout(timerId)
		}
		timerId = setTimeout(pendingFunc, waitTime)
	}

	// 剩余等待时间计算
	const remainingWait = (time: number): number => {
		if (lastCallTime === null) return 0

		const timeSinceLastCall = time - lastCallTime
		const timeSinceLastInvoke = time - lastInvokeTime

		if (maxWait !== undefined) {
			return Math.min(
				wait - timeSinceLastCall,
				maxWait - timeSinceLastInvoke
			)
		}

		return wait - timeSinceLastCall
	}

	// 定时器到期时的处理
	const timerExpired = () => {
		const time = Date.now()
		if (shouldInvoke(time)) {
			return trailingEdge(time)
		}
		// 重新计算剩余时间并重新设置定时器
		startTimer(timerExpired, remainingWait(time))
	}

	// 前缘调用（立即执行）
	const leadingEdge = (time: number) => {
		lastInvokeTime = time
		startTimer(timerExpired, wait)
		return leading ? invokeFunc(time) : result
	}

	// 后缘调用（延迟执行）
	const trailingEdge = (time: number) => {
		timerId = null

		// 只有在有挂起的调用且 trailing 为 true 时才调用
		if (trailing && lastArgs) {
			return invokeFunc(time)
		}
		lastArgs = null
		lastThis = null
		return result
	}

	// 取消挂起的执行
	const cancel = () => {
		if (timerId !== null) {
			clearTimeout(timerId)
		}
		lastInvokeTime = 0
		lastCallTime = null
		lastArgs = null
		lastThis = null
		timerId = null
	}

	// 立即执行挂起的调用
	const flush = (): ReturnType<T> | undefined => {
		if (timerId === null) {
			return result
		}

		const time = Date.now()
		if (shouldInvoke(time)) {
			return trailingEdge(time)
		}

		// 如果当前不能调用，取消定时器并清除状态
		cancel()
		return result
	}

	// 防抖函数主体
	const debounced = function (this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
		const time = Date.now()
		const isInvoking = shouldInvoke(time)

		lastArgs = args
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		lastThis = this
		lastCallTime = time

		if (isInvoking) {
			if (timerId === null) {
				return leadingEdge(lastCallTime)
			}

			if (maxWait !== undefined) {
				// 处理最大等待时间的情况
				startTimer(timerExpired, wait)
				return invokeFunc(lastCallTime)
			}
		}

		if (timerId === null) {
			startTimer(timerExpired, wait)
		}

		return result
	}

	// 绑定 cancel 和 flush 方法
	debounced.cancel = cancel
	debounced.flush = flush

	return debounced as DebouncedFunction<T>
}
