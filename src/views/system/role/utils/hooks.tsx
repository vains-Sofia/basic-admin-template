import { onMounted, reactive, ref } from 'vue'
import type { FindRoleResponse, SaveRoleRequest } from '@/api/types/RoleTypes'
import {
	getRoleList,
	insertRole,
	removeRoleById,
	updateRole,
	updateRolePermissions,
} from '@/api/system/Role'
import type { TableColumn, TablePagination } from '@/components/SmartTable'
import { openDrawer } from '@/components/CommonDrawer'
import RoleMenu from '../form/RoleMenu.vue'
import RoleUpdateForm from '../form/RoleUpdateForm.vue'
import type { FindPermissionResponse } from '@/api/types/PermissionTypes.ts'
import { getMenuList } from '@/api/system/Permission.ts'

export function useRole() {
	// 表格是否加载中
	const loading = ref(true)
	// 角色权限实例
	const roleMenuRef = ref<InstanceType<typeof RoleMenu>>()
	// 修改表单实例
	const formRef = ref<InstanceType<typeof RoleUpdateForm>>()
	// 表格数据列表
	const dataList = ref<FindRoleResponse[]>([])
	// 所有菜单列表
	const allMenus = ref<Array<FindPermissionResponse>>([])
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
		name: '',
		code: '',
		status: '',
		current: pagination.currentPage,
		size: pagination.pageSize,
	})

	/**
	 * 表格列定义
	 */
	const columns: TableColumn[] = [
		{
			title: '角色编号',
			dataKey: 'id',
			align: 'center',
		},
		{
			title: '角色名称',
			dataKey: 'name',
			align: 'center',
		},
		{
			title: '角色标识',
			dataKey: 'code',
			align: 'center',
		},
		{
			title: '备注',
			dataKey: 'description',
			minWidth: 150,
		},
		{
			title: '创建时间',
			dataKey: 'createTime',
			minWidth: 100,
			align: 'center',
		},
		{
			title: '操作',
			fixed: 'right',
			width: 210,
			slot: 'operation',
		},
	]

	/**
	 * 列表数据加载
	 */
	function onSearch() {
		loading.value = true
		getRoleList(form)
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

	/**
	 * 删除角色
	 * @param row 角色数据
	 */
	function handleDelete(row: FindRoleResponse) {
		removeRoleById(row.id).then(() => {
			ElMessage({ type: 'success', message: `您删除了角色名称为${row.name}的这条数据` })
			onSearch()
		})
	}

	/**
	 * 分页-每页行数变化
	 * @param val 每页行数
	 */
	function handleSizeChange(val: number) {
		form.size = val
		onSearch()
	}

	/**
	 * 分页-当前页变化
	 * @param val 当前页码
	 */
	function handleCurrentChange(val: number) {
		form.current = val
		onSearch()
	}

	/**
	 * 打开新增、修改框
	 * @param title 新增/修改
	 * @param row 角色数据
	 */
	const openUpdatePanel = (title = '新增', row?: FindRoleResponse) => {
		openDrawer({
			title: `${title}角色`,
			bodyPadding: 20,
			confirmLoading: true,
			content: () => <RoleUpdateForm ref={formRef} formInline={row as SaveRoleRequest} />,
			onConfirm(close, closeLoading) {
				const updateFormRef = formRef.value?.getRef()
				const formData = formRef.value?.getData()?.value

				function chores() {
					ElMessage({
						type: 'success',
						message: `您${title}了角色名称为${formData.name}的这条数据`,
					})
					close() // 关闭弹框
					onSearch() // 刷新表格数据
				}

				updateFormRef.validate((valid: unknown) => {
					if (valid) {
						// 表单规则校验通过
						if (title === '新增') {
							// 添加角色
							insertRole(formData)
								.then(() => chores())
								.finally(() => closeLoading())
						} else {
							// 修改角色
							updateRole(formData)
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

	const openMenuPanel = (row: FindRoleResponse) => {
		const formInline = {
			roleId: row.id,
			allMenus: allMenus.value,
		}
		openDrawer({
			title: `菜单权限${row?.name ? `（${row.name}）` : ''}`,
			bodyPadding: 20,
			confirmLoading: true,
			content: () => <RoleMenu formInline={formInline} ref={roleMenuRef} />,
			onConfirm(close, closeLoading) {
				// 选中的key
				const permissionIds = [
					...roleMenuRef.value?.getTreeRef().getCheckedKeys(),
					...roleMenuRef.value?.getTreeRef().getHalfCheckedKeys(),
				]
				updateRolePermissions({ roleId: row.id, permissionIds })
					.then(() =>
						ElMessage({
							type: 'success',
							message: `角色名称为${row.name}的菜单权限修改成功`,
						}),
					)
					.finally(() => closeLoading())
			},
		})
	}

	onMounted(() => {
		onSearch()
		getMenuList().then((menus) => {
			allMenus.value = menus
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
		openMenuPanel,
		openUpdatePanel,
		handleSizeChange,
		handleCurrentChange,
	}
}
