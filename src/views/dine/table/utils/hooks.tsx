import { onMounted, reactive, ref } from 'vue'
import type { TableColumn, TablePagination } from '@/components/SmartTable'
import { openDrawer } from '@/components/CommonDrawer'
import { TableStatusEnum } from '@/api/types/Enums.ts'
import type { FindTableInfoResponse, TableInfoRequest } from '@/api/types/TableInfoTypes.ts'
import { createTable, deleteTable, pageTable, updateTable } from '@/api/dine/Table.ts'
import TableUpdateForm from '@/views/dine/table/form/TableUpdateForm.vue'

const tableStatusLabels: Record<TableStatusEnum, string> = {
	[TableStatusEnum.IDLE]: '空闲',
	[TableStatusEnum.OCCUPY]: '占用',
	[TableStatusEnum.RESERVE_A_SEAT]: '留座',
}

const tableStatusTagTypes: Record<TableStatusEnum, 'success' | 'danger' | 'warning'> = {
	[TableStatusEnum.IDLE]: 'success',
	[TableStatusEnum.OCCUPY]: 'danger',
	[TableStatusEnum.RESERVE_A_SEAT]: 'warning',
}

export function useTable() {
	const loading = ref(true)
	const formRef = ref<InstanceType<typeof TableUpdateForm>>()
	const dataList = ref<FindTableInfoResponse[]>([])
	const pagination = reactive<TablePagination>({
		total: 0,
		pageSize: 10,
		currentPage: 1,
	})

	const form = reactive({
		keyword: '',
		storeId: '',
		tableStatus: undefined as TableStatusEnum | undefined,
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
			title: '所属门店',
			dataKey: 'storeName',
			align: 'center',
			minWidth: 120,
		},
		{
			title: '桌台名称',
			dataKey: 'name',
			align: 'left',
			minWidth: 80,
			showOverflowTooltip: true,
		},
		{
			title: '桌台编号',
			dataKey: 'code',
			align: 'center',
			minWidth: 100,
			showOverflowTooltip: true,
		},
		{
			title: '桌台容量',
			dataKey: 'capacity',
			align: 'center',
			width: 100,
		},
		{
			title: '桌台状态',
			dataKey: 'tableStatus',
			formatter: (row: FindTableInfoResponse) => (
				<ElTag type={tableStatusTagTypes[row.tableStatus]}>
					{tableStatusLabels[row.tableStatus]}
				</ElTag>
			),
			align: 'center',
			width: 100,
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

	function pickTableForm(row: TableInfoRequest): TableInfoRequest {
		return {
			storeId: row.storeId,
			name: row.name,
			code: row.code,
			capacity: row.capacity,
			tableStatus: row.tableStatus,
		}
	}

	function onSearch() {
		loading.value = true
		pageTable(form)
			.then((data) => {
				dataList.value = data.records
				pagination.total = data.total
				pagination.pageSize = data.size
				pagination.currentPage = data.current
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

	const openUpdatePanel = (title = '新增', row?: FindTableInfoResponse) => {
		openDrawer({
			title: `${title}桌台`,
			bodyPadding: 20,
			confirmLoading: true,
			props: {
				formInline: row ?? {
					storeId: form.storeId,
					name: '',
					code: '',
					capacity: 4,
					tableStatus: TableStatusEnum.IDLE,
				},
			},
			content: () => <TableUpdateForm ref={formRef} />,
			onConfirm(close, closeLoading) {
				const updateFormRef = formRef.value?.getRef()
				const formData = formRef.value?.getData()?.value

				function chores() {
					ElMessage({
						type: 'success',
						message: `您${title}了桌台名称为${formData.name}的这条数据`,
					})
					close()
					onSearch()
				}

				updateFormRef.validate((valid: unknown) => {
					if (valid) {
						const data = pickTableForm(formData)
						if (title === '新增') {
							createTable(data)
								.then(() => chores())
								.finally(() => closeLoading())
						} else {
							updateTable(formData.id, data)
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

	function handleDelete(row: FindTableInfoResponse) {
		deleteTable(row.id).then(() => {
			ElMessage({
				type: 'success',
				message: `您删除了桌台名称为${row.name}的这条数据`,
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
