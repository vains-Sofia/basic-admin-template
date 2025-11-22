import { type Directive } from 'vue'
import { useDebounce, type DebounceOptions } from '../hooks/useDebounce'

// 指令值的类型定义
type DebounceBindingValue =
	((...args: any[]) => any) // 直接传入函数
	& {
	handler: (...args: any[]) => any
	wait?: number
	options?: DebounceOptions
}

// 存储指令相关数据的接口
interface DebounceDirectiveEl extends HTMLElement {
	_debounce?: {
		handler: (...args: any[]) => any
		wrappedHandler: ReturnType<typeof useDebounce>
		event: string
		options?: DebounceOptions
	}
}

// 解析指令值
const parseValue = (value: DebounceBindingValue): { handler: (...args: any[]) => any; wait?: number; options?: DebounceOptions } => {
	if (typeof value === 'function') {
		return { handler: value }
	}
	return value
}

// 防抖指令
export const vDebounce: Directive<DebounceDirectiveEl, DebounceBindingValue> = {
	mounted(el, binding) {
		const { value, arg: event = 'click', modifiers } = binding
		console.log(binding)

		if (!value || !value.handler) {
			console.warn('v-debounce: 必须提供一个处理函数')
			return
		}

		const { handler, wait, options = {} } = parseValue(value)

		// 从修饰符中提取配置
		const config: DebounceOptions = {
			wait: wait ?? options.wait ?? 300,
			leading: options.leading || modifiers.leading || false,
			trailing: options.trailing ?? (modifiers.trailing !== false),
		}

		// 如果有数字修饰符，将其作为等待时间
		Object.keys(modifiers).forEach(key => {
			const waitTime = parseInt(key)
			if (!isNaN(waitTime)) {
				config.wait = waitTime
			}
		})

		// 创建防抖函数
		const debouncedHandler = useDebounce(handler, config.wait, config)

		// 存储到元素上以便清理
		el._debounce = {
			handler,
			wrappedHandler: debouncedHandler,
			event,
			options: config
		}

		// 添加事件监听
		el.addEventListener(event, debouncedHandler)
	},

	updated(el, binding) {
		const { value, arg: event = 'click' } = binding
		const oldData = el._debounce

		if (!oldData || !value) return

		const { handler, options = {} } = parseValue(value)

		// 如果事件类型或处理函数发生变化，需要重新绑定
		if (event !== oldData.event || handler !== oldData.handler) {
			// 先移除旧的事件监听
			el.removeEventListener(oldData.event, oldData.wrappedHandler)
			oldData.wrappedHandler.cancel()

			// 重新绑定
			const config: DebounceOptions = {
				wait: options.wait || oldData.options?.wait || 300,
				leading: options.leading || oldData.options?.leading || false,
				trailing: options.trailing ?? oldData.options?.trailing ?? true,
			}

			const debouncedHandler = useDebounce(handler, config.wait, config)

			el._debounce = {
				handler,
				wrappedHandler: debouncedHandler,
				event,
				options: config
			}

			el.addEventListener(event, debouncedHandler)
		}
	},

	beforeUnmount(el) {
		const data = el._debounce
		if (data) {
			el.removeEventListener(data.event, data.wrappedHandler)
			data.wrappedHandler.cancel()
			delete el._debounce
		}
	}
}
