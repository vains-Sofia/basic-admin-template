import { onMounted, reactive, type Ref, ref } from 'vue'
import type { FindSysDictItemResponse, FindSysDictTypeResponse } from '@/api/types/DictTypes.ts'
import type { TableColumn, TablePagination } from '@/components/SmartTable'
import { allType, createItem, deleteItem, pageItem, updateItem } from '@/api/system/Dict'
import { openDrawer } from '@/components/CommonDrawer'
import UpdateDictItem from '@/views/system/dict/form/UpdateDictItem.vue'

export function useDict() {
	// 是否启用
	const switchLoadMap = ref<Record<string, boolean>>({})
	// 表格是否加载中
	const loading = ref(true)
	// 所以字典类型
	const allTypes: Ref<FindSysDictTypeResponse[]> = ref([])
	// 修改表单实例
	const formRef = ref<InstanceType<typeof UpdateDictItem>>()
	// 表格数据列表
	const dataList = ref<FindSysDictItemResponse[]>([])
	// 表格分页
	const pagination = reactive<TablePagination>({
		total: 0,
		pageSize: 10,
		currentPage: 1,
	})

	/**
	 * 搜索入参
	 */
	const form = reactive({
		typeCode: '',
		keyword: '',
		status: '',
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
			title: '类型代码',
			dataKey: 'typeCode',
			align: 'left',
			minWidth: 130,
		},
		{
			title: '字典编码',
			dataKey: 'itemCode',
			align: 'center',
		},
		{
			title: '字典名称',
			dataKey: 'itemName',
			align: 'left',
			minWidth: 90,
		},
		{
			title: '排序编号',
			dataKey: 'sortOrder',
			align: 'center',
		},
		{
			title: '状态',
			dataKey: 'status',
			formatter: (row: FindSysDictItemResponse) => (
				<ElSwitch
					loading={switchLoadMap.value[row.id]}
					v-model={row.status}
					active-value={'Y'}
					inactive-value={'N'}
					active-text="启用"
					inactive-text="禁用"
					inline-prompt
					beforeChange={() => beforeChange(row)}
					onChange={() => onChange(row)}
				/>
			),
			align: 'center',
		},
		{
			title: '创建时间',
			minWidth: 165,
			dataKey: 'createTime',
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

	function beforeChange(row: FindSysDictItemResponse): Promise<boolean> {
		return new Promise((resolve, reject) => {
			ElMessageBox.confirm(
				`确认要<strong>${
					row.status === 'Y' ? '禁用' : '启用'
				}</strong><strong style='color:var(--el-color-primary)'>${
					row.itemCode + ' - ' + row.itemName
				}</strong>吗?`,
				'系统提示',
				{
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
					dangerouslyUseHTMLString: true,
					draggable: true,
				},
			)
				.then(() => {
					resolve(true)
				})
				.catch(() => {
					// 用户取消，阻止改变
					reject(false)
				})
		})
	}

	function onChange(row: FindSysDictItemResponse) {
		const id = row.id
		switchLoadMap.value[id] = true

		updateItem(id, row)
			.then(() => {
				ElMessage.success('已成功修改字典状态')

				onSearch()
			})
			.finally(() => (switchLoadMap.value[id] = false))
	}

	/**
	 * 列表数据加载
	 */
	function onSearch() {
		loading.value = true
		pageItem(form)
			.then((data) => {
				dataList.value = data.records
				pagination.total = data.total
				pagination.pageSize = data.size
				pagination.currentPage = data.current

				// 设置字典项是否禁用的加载状态
				dataList.value.forEach((item: FindSysDictItemResponse) => {
					switchLoadMap.value[item.id] = false
				})
			})
			.finally(() => (loading.value = false))

		setTimeout(() => {
			loading.value = false
		}, 500)
	}

	/**
	 * 打开新增、修改框
	 * @param title 新增/修改
	 * @param row 角色数据
	 */
	const openUpdatePanel = (title = '新增', row?: FindSysDictItemResponse) => {
		const typeCode = title !== '新增' ? (row?.typeCode ?? '') : form.typeCode
		const sortOrder = title !== '新增' ? (row?.sortOrder ?? 0) : pagination.total
		openDrawer({
			title: `${title}角色`,
			bodyPadding: 20,
			confirmLoading: true,
			props: {
				typeCode,
				sortOrder,
				formInline: row,
				allTypes: allTypes.value,
			},
			content: () => <UpdateDictItem ref={formRef} />,
			onConfirm(close, closeLoading) {
				const updateFormRef = formRef.value?.getRef()
				const formData = formRef.value?.getData()?.value

				function chores() {
					ElMessage({
						message: `您${title}了字典${formData.itemCode + ' - ' + formData.itemName}的这条数据`,
						type: 'success',
					})
					close() // 关闭弹框
					onSearch() // 刷新表格数据
				}

				updateFormRef.validate((valid: unknown) => {
					if (valid) {
						// 表单规则校验通过
						if (title === '新增') {
							// 添加角色
							createItem(formData)
								.then(() => chores())
								.finally(() => closeLoading())
						} else {
							const id = formData.id
							delete formData.id
							// 修改角色
							updateItem(id, formData)
								.then(() => chores())
								.finally(() => closeLoading())
						}
					} else {
						closeLoading()
					}
				})
				closeLoading()
			},
		})
	}

	/**
	 * 删除字典项
	 * @param row 角色数据
	 */
	function handleDelete(row: FindSysDictItemResponse) {
		deleteItem(row.id).then(() => {
			ElMessage({
				type: 'success',
				message: `您删除了字典${row.itemCode + ' - ' + row.itemName}的这条数据`,
			})
			onSearch()
		})
	}

	/**
	 * 选择字典类型时触发
	 * @param item 选择的字典类型
	 */
	function handleSelectType(item: any) {
		form.typeCode = item.typeCode
		onSearch()
	}

	/**
	 * 删除字典类型时触发
	 */
	function handleDeleteType() {
		form.typeCode = ''
		onSearch()
	}

	/**
	 * 分页-每页行数变化
	 * @param val 每页行数
	 */
	function handleSizeChange(val: number) {
		// console.log(`${val} items per page`);
		form.size = val
		onSearch()
	}

	/**
	 * 分页-当前页变化
	 * @param val 当前页码
	 */
	function handleCurrentChange(val: number) {
		// console.log(`current page: ${val}`);
		form.current = val
		onSearch()
	}

	/** 当CheckBox选择项发生变化时会触发该事件 */
	function handleSelectionChange(val: unknown) {
		// selectedNum.value = val.length;
		console.log(val)
	}

	onMounted(() => {
		onSearch()

		allType().then((res) => {
			allTypes.value = res
		})
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
		handleSelectType,
		handleDeleteType,
		handleSizeChange,
		handleCurrentChange,
		handleSelectionChange,
	}
}
