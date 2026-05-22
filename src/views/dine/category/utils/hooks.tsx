import { onMounted, reactive, ref } from 'vue'
import type { TableColumn, TablePagination } from '@/components/SmartTable'
import { openDrawer } from '@/components/CommonDrawer'
import { StatusEnum } from '@/api/types/Enums.ts'
import type { CategoryRequest, FindCategoryResponse } from '@/api/types/CategoryTypes.ts'
import {
	createCategory,
	deleteCategory,
	pageCategory,
	updateCategory,
} from '@/api/dine/Category.ts'
import CategoryUpdateForm from '@/views/dine/category/form/CategoryUpdateForm.vue'

export function useCategory() {
	const switchLoadMap = ref<Record<string, boolean>>({})
	const loading = ref(true)
	const formRef = ref<InstanceType<typeof CategoryUpdateForm>>()
	const dataList = ref<FindCategoryResponse[]>([])
	const pagination = reactive<TablePagination>({
		total: 0,
		pageSize: 10,
		currentPage: 1,
	})

	const form = reactive({
		keyword: '',
		storeId: undefined as number | undefined,
		status: StatusEnum.ALL,
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
			title: '门店编号',
			dataKey: 'storeId',
			align: 'center',
			minWidth: 120,
		},
		{
			title: '分类名称',
			dataKey: 'name',
			align: 'left',
			minWidth: 160,
			showOverflowTooltip: true,
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
			formatter: (row: FindCategoryResponse) => (
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

	function beforeChange(row: FindCategoryResponse): Promise<boolean> {
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

	function pickCategoryForm(row: CategoryRequest): CategoryRequest {
		return {
			storeId: row.storeId,
			name: row.name,
			sort: row.sort,
			status: row.status,
		}
	}

	function onChange(row: FindCategoryResponse) {
		const id = row.id
		switchLoadMap.value[id] = true
		updateCategory(id, pickCategoryForm(row))
			.then(() => {
				ElMessage.success('已成功修改菜单分类状态')
				onSearch()
			})
			.finally(() => (switchLoadMap.value[id] = false))
	}

	function onSearch() {
		loading.value = true
		pageCategory(form)
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

	const openUpdatePanel = (title = '新增', row?: FindCategoryResponse) => {
		openDrawer({
			title: `${title}菜单分类`,
			bodyPadding: 20,
			confirmLoading: true,
			props: {
				formInline: row ?? {
					storeId: form.storeId,
					name: '',
					sort: pagination.total,
					status: StatusEnum.ENABLE,
				},
			},
			content: () => <CategoryUpdateForm ref={formRef} />,
			onConfirm(close, closeLoading) {
				const updateFormRef = formRef.value?.getRef()
				const formData = formRef.value?.getData()?.value

				function chores() {
					ElMessage({
						type: 'success',
						message: `您${title}了菜单分类名称为${formData.name}的这条数据`,
					})
					close()
					onSearch()
				}

				updateFormRef.validate((valid: unknown) => {
					if (valid) {
						const data = pickCategoryForm(formData)
						if (title === '新增') {
							createCategory(data)
								.then(() => chores())
								.finally(() => closeLoading())
						} else {
							updateCategory(formData.id, data)
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

	function handleDelete(row: FindCategoryResponse) {
		deleteCategory(row.id).then(() => {
			ElMessage({
				type: 'success',
				message: `您删除了菜单分类名称为${row.name}的这条数据`,
			})
			onSearch()
		})
	}

	onMounted(() => {
		onSearch()
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
		handleSizeChange,
		handleCurrentChange,
		handleSelectionChange,
	}
}
