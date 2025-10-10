import { defineComponent, ref, nextTick, type PropType, type CSSProperties } from 'vue'
import { ElTooltip } from 'element-plus'
import type { Placement } from 'element-plus'
import type { TextTooltipProps } from './type'

export default defineComponent({
	name: 'TextTooltip',
	props: {
		content: {
			type: String,
			required: true,
		},
		placement: {
			type: String as PropType<Placement>,
			default: 'top',
		},
		showAfter: {
			type: Number,
			default: 100,
		},
		maxWidth: {
			type: [String, Number],
			default: '100%',
		},
		lineClamp: {
			type: [String, Number],
			default: 1,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		tooltipClass: {
			type: String,
			default: '',
		},
		effect: {
			type: String as PropType<'dark' | 'light'>,
			default: 'dark',
		},
		rawContent: {
			type: Boolean,
			default: false,
		},
	} satisfies Record<keyof TextTooltipProps, any>,
	emits: ['overflow-change'],
	setup(props: TextTooltipProps, { slots, emit }) {
		const textRef = ref<HTMLElement>()
		const showTooltip = ref(false)

		const checkOverflow = async () => {
			if (props.disabled) return

			await nextTick()
			const element = textRef.value
			if (!element) return

			let isOverflow: boolean

			if (props.lineClamp === 1) {
				// 单行溢出检测
				isOverflow = element.scrollWidth > element.clientWidth
			} else {
				// 多行溢出检测
				isOverflow = element.scrollHeight > element.clientHeight
			}

			if (showTooltip.value !== isOverflow) {
				showTooltip.value = isOverflow
				emit('overflow-change', isOverflow)
			}
		}

		const getTextStyle = (): CSSProperties => {
			const baseStyle: CSSProperties = {
				maxWidth:
					typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
				wordBreak: 'break-all',
				cursor: showTooltip.value ? 'pointer' : 'default',
			}

			if (props.lineClamp === 1) {
				return {
					...baseStyle,
					whiteSpace: 'nowrap',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
				}
			} else {
				return {
					...baseStyle,
					display: '-webkit-box',
					WebkitBoxOrient: 'vertical',
					WebkitLineClamp: props.lineClamp,
					overflow: 'hidden',
					textOverflow: 'ellipsis',
				}
			}
		}

		return () => (
			<ElTooltip
				raw-content={props.rawContent}
				content={props.content}
				disabled={!showTooltip.value || props.disabled}
				placement={props.placement}
				showAfter={props.showAfter}
				popperClass={props.tooltipClass}
				effect={props.effect}
				v-slots={{
					default: () => (
						<div
							ref={textRef}
							style={getTextStyle()}
							onMouseenter={checkOverflow}
							onFocus={checkOverflow}
						>
							{slots.default?.() ?? props.content}
						</div>
					),
				}}
			/>
		)
	},
})
