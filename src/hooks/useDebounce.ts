import { onBeforeUnmount, type Ref, ref, watch } from 'vue'
import { debounce, type AnyFn } from '../utils/debounce'

/**
 * Vue Hook: 防抖函数
 * @param fn        需要防抖的函数
 * @param wait      延迟时间（ms）
 * @param immediate 是否立即执行
 */
export function useDebounce<T extends AnyFn>(fn: T, wait = 300, immediate = false) {
	const debounced = debounce(fn, wait, immediate)

	onBeforeUnmount(() => {
		debounced.cancel()
	})

	return {
		run: debounced,
		cancel: debounced.cancel,
		flush: debounced.flush,
		original: debounced.original,
	}
}

export function useDebouncedRef<T>(
	initial: T,
	wait = 300,
): { value: Ref<T>; set: (v: T) => void; cancel: () => void } {
	const raw = ref(initial) as Ref<T>
	const debounced = ref(initial) as Ref<T>
	let timer: ReturnType<typeof setTimeout> | null = null

	const set = (v: T) => {
		raw.value = v
	}

	const cancel = () => {
		if (timer) {
			clearTimeout(timer)
			timer = null
		}
	}

	watch(
		raw,
		(newVal: any) => {
			if (timer) clearTimeout(timer)
			timer = setTimeout(() => {
				debounced.value = newVal
				timer = null
			}, wait)
		},
		{ immediate: false, deep: true },
	)

	onBeforeUnmount(cancel)

	return { value: debounced, set, cancel }
}
