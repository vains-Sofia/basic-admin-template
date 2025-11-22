import { defineComponent } from 'vue'
import { IconSelect } from '@/components/IconSelect'
import { Icon } from '@iconify/vue'

const styles = `
.input-icon-select-suffix {
  padding: 0;
  width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.input-icon-select-suffix:hover {
  color: var(--el-color-primary) !important;
}

.input-icon-select-copy {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--el-text-color-secondary);
}

.input-icon-select-copy:hover {
  color: var(--el-color-primary);
}

.el-input__inner {
  pointer-events: none; /* 禁止手动输入 */
}
`

if (!document.getElementById('input-icon-select-style')) {
	const el = document.createElement('style')
	el.id = 'input-icon-select-style'
	el.innerHTML = styles
	document.head.appendChild(el)
}

export default defineComponent({
	name: 'InputIconSelect',

	props: {
		tooltip: { type: Boolean, default: false },
		pageSize: { type: Number, default: 35 },
		modelValue: { type: String, default: '' },
		inputPlaceholder: { type: String, default: '请选择图标' },
		iconSelectPlaceholder: { type: String, default: '搜索图标' },
	},

	emits: ['update:modelValue'],

	setup(props, { emit }) {
		const copy = (text: string) => {
			if (!props.modelValue) {
				ElMessage.info(`无图标`)
				return
			}
			navigator.clipboard
				.writeText(text)
				.then(() => {
					ElMessage.success(`已复制: ${text}`)
				})
				.catch(() => {
					ElMessage.error('复制失败')
				})
		}

		return () => (
			<ElInput modelValue={props.modelValue} placeholder={props.inputPlaceholder} readonly>
				{{
					suffix: () => (
						<div style="display: flex; align-items: center;">
							{/* 图标选择 popover */}
							<ElPopover placement="bottom" width={450} trigger="click">
								{{
									reference: () => (
										<div class="input-icon-select-suffix">
											{props.modelValue ? (
												<Icon
													icon={props.modelValue}
													width={20}
													height={20}
												/>
											) : (
												<Icon
													icon="ri:search-eye-line"
													width={20}
													height={20}
												/>
											)}
										</div>
									),

									default: () => (
										<IconSelect
											tooltip={props.tooltip}
											pageSize={props.pageSize}
											placeholder={props.iconSelectPlaceholder}
											onUpdate:modelValue={(icon) =>
												emit('update:modelValue', icon)
											}
										/>
									),
								}}
							</ElPopover>

							{/* 复制按钮 */}
							<ElTooltip placement="top" content="点击复制图标">
								<div
									class="input-icon-select-copy"
									onClick={() => copy(props.modelValue)}
								>
									<Icon icon="ri:file-copy-line" width={18} height={18} />
								</div>
							</ElTooltip>
						</div>
					),
				}}
			</ElInput>
		)
	},
})
