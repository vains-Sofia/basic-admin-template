import { onMounted, reactive, ref } from 'vue'
import type { TableColumn, TablePagination } from '@/components/SmartTable'
import { openDrawer } from '@/components/CommonDrawer'
import { createDish, deleteDish, pageDish, updateDish } from '@/api/dine/Dish.ts'
import type { DishRequest, FindDishResponse } from '@/api/types/DishTypes.ts'
import { RecommendEnum, StatusEnum } from '@/api/types/Enums.ts'
import type { FindCategoryResponse } from '@/api/types/CategoryTypes.ts'
import DishUpdateForm from '@/views/dine/dish/form/DishUpdateForm.vue'

const recommendTextMap: Record<RecommendEnum, string> = {
	[RecommendEnum.NORMAL]: '普通',
	[RecommendEnum.RECOMMEND]: '推荐',
}

function normalizeString(value?: string | number) {
	return value === undefined || value === null ? '' : String(value)
}

export function useDish(loadOnMounted = false) {
	const switchLoadMap = ref<Record<string, boolean>>({})
	const loading = ref(false)
	const formRef = ref<InstanceType<typeof DishUpdateForm>>()
	const dataList = ref<FindDishResponse[]>([])
	const pagination = reactive<TablePagination>({
		total: 0,
		pageSize: 10,
		currentPage: 1,
	})

	const dishImages = () => dataList.value.filter((item) => !!item.image).map((item) => item.image)

	const form = reactive({
		keyword: '',
		storeId: '',
		categoryId: '',
		current: pagination.currentPage,
		size: pagination.pageSize,
	})

	const columns: TableColumn[] = [
		{
			title: '勾选列',
			type: 'selection',
			dataKey: 'selection',
			fixed: 'left',
			align: 'center',
		},
		{
			title: '编号',
			dataKey: 'id',
			width: 180,
			align: 'center',
		},
		{
			title: '封面图',
			dataKey: 'image',
			align: 'center',
			width: 110,
			formatter: ({ image, name }) =>
				image ? (
					<ElImage
						fit="cover"
						src={image}
						initial-index={dishImages().indexOf(image)}
						preview-teleported={true}
						preview-src-list={dishImages()}
						class="w-[64px] h-[64px] rounded align-middle"
					/>
				) : (
					<ElAvatar shape="square" size={64}>
						{name?.slice(0, 1) || '菜'}
					</ElAvatar>
				),
		},
		{
			title: '菜品名称',
			dataKey: 'name',
			align: 'left',
			minWidth: 150,
			showOverflowTooltip: true,
		},
		{
			title: '分类编号',
			dataKey: 'categoryId',
			align: 'center',
			minWidth: 160,
			showOverflowTooltip: true,
		},
		{
			title: '价格',
			dataKey: 'price',
			align: 'right',
			width: 110,
			formatter: ({ price }) => `¥${Number(price ?? 0).toFixed(2)}`,
		},
		{
			title: '标签',
			dataKey: 'labels',
			align: 'left',
			minWidth: 150,
			formatter: ({ labels }) =>
				labels?.length ? (
					<div class="flex flex-wrap gap-1">
						{labels.map((label: string) => (
							<ElTag key={label} size="small" effect="plain">
								{label}
							</ElTag>
						))}
					</div>
				) : (
					'-'
				),
		},
		{
			title: '推荐状态',
			dataKey: 'recommend',
			align: 'center',
			width: 100,
			formatter: ({ recommend }) => (
				<ElTag
					type={recommend === RecommendEnum.RECOMMEND ? 'success' : 'info'}
					effect="plain"
				>
					{recommendTextMap[recommend as RecommendEnum] ?? '普通'}
				</ElTag>
			),
		},
		{
			title: '烹饪时间',
			dataKey: 'cookingTime',
			align: 'center',
			width: 110,
			formatter: ({ cookingTime }) => (cookingTime ? `${cookingTime} 分钟` : '-'),
		},
		{
			title: '单位',
			dataKey: 'unit',
			align: 'center',
			width: 90,
		},
		{
			title: '销量',
			dataKey: 'sales',
			align: 'center',
			width: 90,
		},
		{
			title: '排序编号',
			dataKey: 'sort',
			align: 'center',
			width: 110,
		},
		{
			title: '状态',
			dataKey: 'status',
			formatter: (row: FindDishResponse) => (
				<ElSwitch
					loading={switchLoadMap.value[row.id]}
					v-model={row.status}
					active-value={StatusEnum.ENABLE}
					inactive-value={StatusEnum.DISABLE}
					active-text="启用"
					inactive-text="禁用"
					inline-prompt
					beforeChange={() => beforeChange(row)}
					onChange={() => onChange(row)}
				/>
			),
			align: 'center',
			width: 110,
		},
		{
			title: '创建时间',
			dataKey: 'createTime',
			minWidth: 165,
			align: 'center',
		},
		{
			title: '操作',
			fixed: 'right',
			width: 145,
			dataKey: 'operation',
			slot: 'operation',
		},
	]

	function beforeChange(row: FindDishResponse): Promise<boolean> {
		return new Promise((resolve, reject) => {
			ElMessageBox.confirm(
				`确认要<strong>${
					row.status === StatusEnum.ENABLE ? '禁用' : '启用'
				}</strong><strong style='color:var(--el-color-primary)'>${row.name}</strong>吗?`,
				'系统提示',
				{
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
					dangerouslyUseHTMLString: true,
					draggable: true,
				},
			)
				.then(() => resolve(true))
				.catch(() => reject(false))
		})
	}

	function pickDishForm(row: Partial<FindDishResponse> & Partial<DishRequest>): DishRequest {
		return {
			storeId: normalizeString(row.storeId),
			categoryId: normalizeString(row.categoryId),
			name: row.name ?? '',
			image: row.image ?? '',
			images: row.images ?? [],
			description: row.description ?? '',
			price: Number(row.price ?? 0),
			labels: row.labels ?? [],
			recommend: row.recommend ?? RecommendEnum.NORMAL,
			cookingTime: Number(row.cookingTime ?? 0),
			unit: row.unit ?? '',
			sort: Number(row.sort ?? 0),
			status: row.status ?? StatusEnum.ENABLE,
		}
	}

	function onChange(row: FindDishResponse) {
		const id = row.id
		switchLoadMap.value[id] = true
		updateDish(id, pickDishForm(row))
			.then(() => {
				ElMessage.success('已成功修改菜品状态')
				onSearch()
			})
			.finally(() => (switchLoadMap.value[id] = false))
	}

	function onSearch(resetPage = false) {
		if (resetPage) {
			form.current = 1
		}

		if (!form.storeId) {
			dataList.value = []
			pagination.total = 0
			pagination.currentPage = 1
			loading.value = false
			return
		}

		loading.value = true
		pageDish(form)
			.then((data) => {
				dataList.value = data.records
				pagination.total = data.total
				pagination.pageSize = data.size
				pagination.currentPage = data.current
				dataList.value.forEach((item) => {
					switchLoadMap.value[item.id] = false
				})
			})
			.finally(() => (loading.value = false))

		setTimeout(() => {
			loading.value = false
		}, 500)
	}

	function handleStoreChange(storeId: string) {
		form.storeId = storeId
		form.categoryId = ''
		form.current = 1
		onSearch()
	}

	function handleSelectCategory(item: FindCategoryResponse) {
		form.categoryId = normalizeString(item.id)
		form.current = 1
		onSearch()
	}

	function handleDeleteCategory() {
		form.categoryId = ''
		form.current = 1
		onSearch()
	}

	function handleReset() {
		form.keyword = ''
		form.current = 1
		onSearch()
	}

	function handleSizeChange(val: number) {
		form.size = val
		form.current = 1
		onSearch()
	}

	function handleCurrentChange(val: number) {
		form.current = val
		onSearch()
	}

	function handleSelectionChange(val: unknown) {
		console.log(val)
	}

	const openUpdatePanel = (title = '新增', row?: FindDishResponse) => {
		if (title === '新增' && !form.storeId) {
			ElMessage.warning('请先选择门店')
			return
		}

		openDrawer({
			title: `${title}菜品`,
			bodyPadding: 20,
			confirmLoading: true,
			props: {
				formInline: row
					? pickDishForm(row)
					: {
							storeId: form.storeId,
							categoryId: form.categoryId,
							name: '',
							image: '',
							images: [],
							description: '',
							price: 0,
							labels: [],
							recommend: RecommendEnum.NORMAL,
							cookingTime: 0,
							unit: '份',
							sort: pagination.total,
							status: StatusEnum.ENABLE,
						},
			},
			content: () => <DishUpdateForm ref={formRef} />,
			onConfirm(close, closeLoading) {
				const updateFormRef = formRef.value?.getRef()
				const formData = formRef.value?.getData()?.value

				function chores() {
					ElMessage({
						type: 'success',
						message: `您${title}了菜品名称为${formData.name}的这条数据`,
					})
					close()
					onSearch()
				}

				updateFormRef.validate((valid: unknown) => {
					if (valid) {
						const data = pickDishForm(formData)
						if (title === '新增') {
							createDish(data)
								.then(() => chores())
								.finally(() => closeLoading())
						} else {
							updateDish(row!.id, data)
								.then(() => chores())
								.finally(() => closeLoading())
						}
					} else {
						closeLoading()
					}
				})
			},
		})
	}

	function handleDelete(row: FindDishResponse) {
		deleteDish(row.id).then(() => {
			ElMessage({
				type: 'success',
				message: `您删除了菜品名称为${row.name}的这条数据`,
			})
			onSearch()
		})
	}

	onMounted(() => {
		if (loadOnMounted) {
			onSearch()
		}
	})

	return {
		form,
		columns,
		loading,
		onSearch,
		dataList,
		pagination,
		handleDelete,
		openUpdatePanel,
		handleStoreChange,
		handleSelectCategory,
		handleDeleteCategory,
		handleReset,
		handleSizeChange,
		handleCurrentChange,
		handleSelectionChange,
	}
}
