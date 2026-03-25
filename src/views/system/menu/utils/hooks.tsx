import { onMounted, reactive, ref } from 'vue'
import type { FindPermissionResponse } from '@/api/types/PermissionTypes.ts'
import type { TableColumnV2 } from '@/components/SmartVirtualizedTable'
import {
	getMenuList,
	insertPermission,
	removePermissionById,
	updatePermission,
} from '@/api/system/Permission.ts'
import { listToTree, type TreeNode } from '@/utils/Common.ts'
import { Icon } from '@iconify/vue'
import { openDrawer } from '@/components/CommonDrawer'
import MenuUpdateForm from '@/views/system/menu/form/MenuUpdateForm.vue'
import { TextTooltip } from '@/components/TextTooltip'

export function useMenu() {
	// 修改表单实例
	const updateFormRef = ref<InstanceType<typeof MenuUpdateForm>>()
	// 表格是否加载中
	const loading = ref(true)
	// 表格数据列表
	const dataList = ref<FindPermissionResponse[]>([])

	/**
	 * 搜索入参
	 */
	const form = reactive({
		title: '',
	})

	/**
	 * 获取权限类型的文字
	 * @param type 类型
	 * @param text tag还是汉字的类型
	 */
	const getMenuType = (type: number | undefined, text = false) => {
		switch (type) {
			case 0:
				return text ? '菜单' : 'primary'
			case 1:
				return text ? 'iframe' : 'warning'
			case 2:
				return text ? '外链' : 'danger'
			case 3:
				return text ? '按钮' : 'info'
		}
	}

	/**
	 * 获取权限标签的类型
	 * @param type 权限的类型
	 */
	const getTagType = (type: number | undefined) => {
		switch (type) {
			case 0:
				return 'primary'
			case 1:
				return 'warning'
			case 2:
				return 'danger'
			case 3:
				return 'info'
		}
	}

	const columns: TableColumnV2[] = [
		{
			title: '菜单名称',
			dataKey: 'title',
			align: 'left',
			class: 'menu-title',
			formatter: ({ icon, title }) => (
				<>
					{icon && <Icon icon={icon} />}
					<TextTooltip content={title} class={'menu-title-text'}>
						{title}
					</TextTooltip>
				</>
			),
			width: 200,
		},
		{
			title: '菜单类型',
			dataKey: 'permissionType',
			width: 100,
			cellRenderer: ({ rowData }: any) => (
				<ElTag type={getTagType(rowData.permissionType)} effect="plain">
					{getMenuType(rowData.permissionType, true)}
				</ElTag>
			),
		},
		{
			title: '路由路径',
			dataKey: 'path',
			tooltip: true
		},
		{
			title: '组件路径',
			dataKey: 'component',
			formatter: ({ path, component }: any) => (
				<TextTooltip content={component ? component : path}>
					{component ? component : path}
				</TextTooltip>
			),
		},
		{
			title: '权限标识',
			dataKey: 'permission',
			formatter: ({ permission }: any) => (
				<TextTooltip content={permission}>
					{permission}
				</TextTooltip>
			),
		},
		{
			title: '排序',
			dataKey: 'rank',
			width: 100,
		},
		{
			title: '显示',
			dataKey: 'showLink',
			cellRenderer: ({ rowData }: any) => (rowData.showLink ? '是' : '否'),
			width: 100,
		},
		{
			title: '操作',
			width: 210,
			slot: 'operation',
		},
	]

	/**
	 * 列表数据加载
	 */
	function onSearch() {
		loading.value = true
		getMenuList()
			.then((permissions) => {
				dataList.value = listToTree(permissions as TreeNode[]) as FindPermissionResponse[]
			})
			.finally(() => (loading.value = false))

		setTimeout(() => {
			loading.value = false
		}, 500)
	}

	/**
	 * 打开新增、修改框
	 * @param title 新增/修改
	 * @param row 用户数据
	 * @param rank 排序号
	 * @param parentId 父节点
	 */
	const openUpdatePanel = (
		title = '新增',
		row?: FindPermissionResponse,
		rank?: number,
		parentId?: string,
	) => {
		openDrawer({
			title: `${title}菜单`,
			bodyPadding: 20,
			size: '50%',
			confirmLoading: true,
			props: {
				formInline: row,
				rank,
				parentId,
				higherMenuOptions: JSON.parse(JSON.stringify(dataList.value)),
			},
			content: () => <MenuUpdateForm ref={updateFormRef} />,
			onConfirm: (close, closeLoading) => {
				const menuUpdateFormRef = updateFormRef.value?.getRef()
				const formData = updateFormRef.value?.getData()?.value

				function chores() {
					ElMessage({
						type: 'success',
						message: `您${title}了菜单名称为${formData.title}的这条数据`,
					})
					close() // 关闭弹框
					onSearch() // 刷新表格数据
				}

				menuUpdateFormRef.validate((valid: unknown) => {
					if (valid) {
						// 表单规则校验通过
						if (title === '新增') {
							// 添加角色
							insertPermission(formData)
								.then(() => chores())
								.finally(() => closeLoading())
						} else {
							// 修改角色
							updatePermission(formData)
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

	/**
	 * 删除
	 * @param row 删除行数据
	 */
	const handleDelete = (row: FindPermissionResponse) => {
		removePermissionById(row.id).then(() => {
			onSearch()
			ElMessage({
				type: 'success',
				message: `您删除了菜单名称为${row.title}的这条数据`,
			})
		})
	}

	onMounted(() => onSearch())

	return {
		form,
		columns,
		loading,
		dataList,
		onSearch,
		handleDelete,
		openUpdatePanel,
	}
}
