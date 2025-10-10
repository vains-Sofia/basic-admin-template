import { type DirectiveBinding } from 'vue'
import { debounce, type Debounced } from '../utils/debounce'

type Handler = (...args: any[]) => any

interface BindingValue {
	handler: Handler
	delay?: number
	event?: string
	immediate?: boolean
}

interface DebounceRecord {
	event: string
	listener: EventListener
	cancel: () => void
}

const records = new WeakMap<Element, DebounceRecord>()

export default {
	mounted(el: Element, binding: DirectiveBinding<BindingValue | Handler>) {
		applyDebounce(el, binding)
	},
	updated(el: Element, binding: DirectiveBinding<BindingValue | Handler>) {
		removeDebounce(el)
		applyDebounce(el, binding)
	},
	unmounted(el: Element) {
		removeDebounce(el)
	},
}

function parseBinding(binding: DirectiveBinding<BindingValue | Handler>) {
	let handler: Handler
	let delay = 300
	let event = 'click'
	let immediate = false

	if (typeof binding.value === 'function') {
		handler = binding.value
	} else {
		const value = binding.value
		handler = value.handler
		delay = value.delay ?? delay
		event = value.event ?? event
		immediate = value.immediate ?? immediate
	}

	return { handler, delay, event, immediate }
}

function applyDebounce(el: Element, binding: DirectiveBinding<BindingValue | Handler>) {
	const { handler, delay, event, immediate } = parseBinding(binding)

	if (!handler || typeof handler !== 'function') {
		console.warn('[v-debounce] binding value must be a function or an object with a handler.')
		return
	}

	const debounced = debounce(handler, delay, immediate)
	const listener = (e: Event) => debounced(e)

	el.addEventListener(event, listener)
	records.set(el, { event, listener, cancel: debounced.cancel })
}

function removeDebounce(el: Element) {
	const record = records.get(el)
	if (!record) return
	el.removeEventListener(record.event, record.listener)
	record.cancel()
	records.delete(el)
}
