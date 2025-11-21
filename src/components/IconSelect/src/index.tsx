// IconSelect.tsx 全量升级版：支持 Tooltip、深色模式、IconJson 新结构
import { computed, defineComponent, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { IconJson } from '../data'

// ========= 样式（含深色模式） =========
const style = `
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
  gap: 10px;
  padding: 12px;
}
.icon-item {
  width: 42px;
  height: 42px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e5e6eb;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all .18s ease;
  user-select: none;
}
.dark .icon-item {
  background: #1f1f1f;
  border-color: #444;
}
.icon-item:hover {
  border-color: #409eff;
  box-shadow: 0 0 4px rgba(64, 158, 255, 0.4);
  transform: scale(1.12);
}
.icon-item.active {
  border-color: #409eff !important;
  background: rgba(64, 158, 255, 0.08);
  box-shadow: 0 0 6px rgba(64, 158, 255, 0.5);
}
.dark .icon-item.active {
  background: rgba(64, 158, 255, 0.16);
}
.pagination-wrapper {
  padding: 8px 0 14px;
  text-align: center;
}
.icon-select-input {
  margin-bottom: 10px;
}
`
if (!document.getElementById('icon-select-style')) {
	const el = document.createElement('style')
	el.id = 'icon-select-style'
	el.innerHTML = style
	document.head.appendChild(el)
}

export default defineComponent({
	name: 'IconSelect',

	props: {
		tooltip: { type: Boolean, default: false },
		pageSize: { type: Number, default: 35 },
		modelValue: { type: String, default: '' },
		placeholder: { type: String, default: '搜索图标' },
	},

	emits: ['update:modelValue'],

	setup(props, { emit }) {
		const keyword = ref('')
		const active = ref(IconJson[0]?.type || '')
		const currentPage = ref(1)

		const activeItem = computed(() => IconJson.find((i) => i.type === active.value)!)

		const filteredList = computed(() => {
			return activeItem.value.icons.filter((i) => i.includes(keyword.value))
		})

		const paginated = computed(() => {
			const start = (currentPage.value - 1) * props.pageSize
			return filteredList.value.slice(start, start + props.pageSize)
		})

		const select = (icon: string) => emit('update:modelValue', icon)

		const renderIcons = () => (
			<div class="icon-grid">
				{paginated.value.map((item) => {
					const isActive = props.modelValue === `${active.value}:${item}`
					return props.tooltip ? (
						<ElTooltip content={`${active.value}:${item}`} placement="top">
							<div
								class={['icon-item', isActive ? 'active' : '']}
								onClick={() => select(`${active.value}:${item}`)}
							>
								<Icon icon={`${active.value}:${item}`} width="22" height="22" />
							</div>
						</ElTooltip>
					) : (
						<div
							class={['icon-item', isActive ? 'active' : '']}
							onClick={() => select(`${active.value}:${item}`)}
						>
							<Icon icon={`${active.value}:${item}`} width="22" height="22" />
						</div>
					)
				})}
			</div>
		)

		return () => (
			<div>
				<ElInput
					v-model={keyword.value}
					placeholder={props.placeholder}
					clearable
					class="icon-select-input"
				/>

				<ElTabs v-model={active.value}>
					{IconJson.map((item) => (
						<ElTabPane label={item.label} name={item.type} />
					))}
				</ElTabs>

				{renderIcons()}

				<div class="pagination-wrapper">
					<ElPagination
						small
						layout="prev, pager, next"
						total={filteredList.value.length}
						page-size={props.pageSize}
						current-page={currentPage.value}
						onUpdate:current-page={(p: number) => (currentPage.value = p)}
					/>
				</div>
			</div>
		)
	},
})
