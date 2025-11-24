import type { Directive, DirectiveBinding } from 'vue'
import { ElMessage } from 'element-plus'

// 回退方案
function fallbackCopyTextToClipboard(text: string): Promise<void> {
	return new Promise((resolve, reject) => {
		try {
			const textarea = document.createElement('textarea')
			textarea.value = text
			textarea.style.position = 'fixed'
			textarea.style.left = '-9999px'
			textarea.style.top = '0'
			document.body.appendChild(textarea)
			textarea.select()
			const ok = document.execCommand('copy')
			document.body.removeChild(textarea)
			if (ok) {
				resolve()
			} else {
				reject(new Error('execCommand failed'))
			}
		} catch (err) {
			reject(err)
		}
	})
}

function doCopy(text: string): void {
	const trimmed = text ? text.toString().trim() : ''

	if (!trimmed) {
		ElMessage.info('没有可复制的内容')
		return
	}

	const onSuccess = function () {
		ElMessage.success('已复制: ' + trimmed)
	}
	const onFail = function () {
		ElMessage.error('复制失败')
	}

	// Clipboard API
	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard
			.writeText(trimmed)
			.then(onSuccess)
			.catch(() => {
				fallbackCopyTextToClipboard(trimmed).then(onSuccess).catch(onFail)
			})
		return
	}

	// fallback
	fallbackCopyTextToClipboard(trimmed).then(onSuccess).catch(onFail)
}

const vCopy: Directive<HTMLElement, string | (() => string)> = {
	mounted(el: HTMLElement, binding: DirectiveBinding<string | (() => string)>) {
		// 支持自定义触发事件：v-copy:click、v-copy:dblclick
		const event = binding.arg || 'click'

		const handler = function () {
				const value = binding.value
				const text = typeof value === 'function' ? value() : value
				doCopy(text || '')
			}

			// 挂到元素上，方便解绑
		;(el as any).__vCopyEvent = event
		;(el as any).__vCopyHandler = handler

		el.addEventListener(event, handler)
	},

	beforeUnmount(el: HTMLElement) {
		const event = (el as any).__vCopyEvent
		const handler = (el as any).__vCopyHandler
		if (event && handler) {
			el.removeEventListener(event, handler)
		}
		delete (el as any).__vCopyEvent
		delete (el as any).__vCopyHandler
	},
}

export default vCopy
