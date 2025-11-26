import { defineComponent, ref, onBeforeUnmount, watch, type PropType } from 'vue'
import { ElInput, ElButton, ElIcon } from 'element-plus'
import { Icon } from '@iconify/vue'

export default defineComponent({
	name: 'VerifyCodeInput',
	props: {
		modelValue: {
			type: String,
			required: true,
		},
		placeholder: {
			type: String,
			default: '',
		},
		buttonText: {
			type: String,
			default: '获取验证码',
		},
		countdownSeconds: {
			type: Number,
			default: 60,
		},
		requestFn: {
			type: Function as PropType<() => Promise<any>>,
			default: undefined,
		},
	},
	emits: ['update:modelValue'],
	setup(props, { emit, attrs }) {
		/**
		 * 内部状态
		 */
		const innerValue = ref(props.modelValue)
		watch(
			() => props.modelValue,
			(val) => (innerValue.value = val),
		)
		watch(innerValue, (val) => emit('update:modelValue', val))

		const countdown = ref(props.countdownSeconds)
		const isCounting = ref(false)
		const isLoading = ref(false)
		let timer: number | null = null

		/**
		 * 按钮点击事件
		 */
		const handleClick = async () => {
			if (isCounting.value || isLoading.value) return
			try {
				isLoading.value = true
				if (props.requestFn) {
					await props.requestFn()
				} else {
					await new Promise((resolve) => setTimeout(resolve, 1000))
				}
				startCountdown()
			} catch (err) {
				console.error('获取验证码失败：', err)
			} finally {
				isLoading.value = false
			}
		}

		/**
		 * 开始倒计时
		 */
		const startCountdown = () => {
			isCounting.value = true
			countdown.value = props.countdownSeconds
			timer = window.setInterval(() => {
				countdown.value--
				if (countdown.value <= 0) {
					clearTimer()
				}
			}, 1000)
		}

		/**
		 * 清理定时器
		 */
		const clearTimer = () => {
			if (timer) {
				clearInterval(timer)
				timer = null
			}
			isCounting.value = false
		}

		onBeforeUnmount(() => {
			clearTimer()
		})

		return () => (
			<div style="display: inline-block;width: 100%;">
				<ElInput
					{...attrs}
					v-model={innerValue.value}
					placeholder={props.placeholder}
					clearable
				>
					{{
						prefix: () => (
							<ElIcon class="el-input__icon">
								<Icon icon="ri:shield-keyhole-line" />
							</ElIcon>
						),
						append: () => (
							<ElButton
								plain
								style={{ width: '120px' }}
								loading={isLoading.value}
								disabled={isCounting.value || isLoading.value}
								onClick={handleClick}
							>
								{isCounting.value ? `${countdown.value}s` : props.buttonText}
							</ElButton>
						),
					}}
				</ElInput>
			</div>
		)
	},
})
