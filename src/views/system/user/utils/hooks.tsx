import type { TableColumn, TablePagination } from '@/components/SmartTable'
import { h, onMounted, reactive, ref } from 'vue'
import {
	getUserList,
	insertBasicUser,
	removeBasicUserById,
	resetPassword,
	updateBasicUser,
	updateUserRoles,
} from '@/api/system/User.ts'
import type { FindBasicUserResponse, SaveBasicUserRequest } from '@/api/types/UserTypes.ts'
import { openDrawer } from '@/components/CommonDrawer'
import UpdateUserForm from '../form/index.vue'
import { openDialog } from '@/components/CommonDialog'
import { ImageCropper } from '@/components/ImageCropper'
import { uploadByPreSignedUrl, uploadPreSigned } from '@/api/system/Common.ts'
import ResetPassword from '@/views/system/user/form/ResetPassword.vue'
import { getAllRoleList } from '@/api/system/Role.ts'
import type { FindRoleResponse } from '@/api/types/RoleTypes.ts'
import UserRoles from '@/views/system/user/form/UserRoles.vue'

export function useUser() {
	// 所有角色
	const allRoles = ref<Array<FindRoleResponse>>([])
	// 修改表单实例
	const formRef = ref<InstanceType<typeof UpdateUserForm>>()
	// 表格数据
	const dataList = ref<FindBasicUserResponse[]>([])
	// 表格是否加载中
	const loading = ref(true)
	// 分页
	const pagination = reactive<TablePagination>({
		total: 0,
		pageSize: 10,
		currentPage: 1,
	})

	/**
	 * 表格列
	 */
	const columns: TableColumn[] = [
		{
			title: '勾选列', // 如果需要表格多选，此处title必须设置
			dataKey: 'index',
			type: 'selection',
			width: 30,
		},
		{
			title: '用户编号',
			dataKey: 'id',
			minWidth: 120,
		},
		{
			title: '用户头像',
			dataKey: 'picture',
			formatter: ({ picture }) => (
				<ElImage
					fit="cover"
					preview-teleported={true}
					src={picture}
					preview-src-list={Array.of(picture)}
					class={'w-[80px] h-[80px] full align-middle'}
				/>
			),
			minWidth: 80,
		},
		{
			title: '用户名称',
			dataKey: 'username',
			minWidth: 60,
		},
		{
			title: '用户昵称',
			dataKey: 'nickname',
			minWidth: 80,
		},
		{
			title: '性别',
			dataKey: 'gender',
			minWidth: 50,
			formatter: ({ gender, dataKeys }) => (
				<ElTag
					size={dataKeys?.size}
					type={gender === 1 || gender === 2 ? 'primary' : 'danger'}
					effect="plain"
				>
					{/*0未知的性别、1男性、2女性、9未说明的性别*/}
					{gender === 0 ? '未知' : gender === 1 ? '男' : gender === 2 ? '女' : '未说明'}
				</ElTag>
			),
		},
		{
			title: '手机号码',
			dataKey: 'phoneNumber',
			minWidth: 90,
		},
		{
			title: '电子邮箱',
			dataKey: 'email',
			minWidth: 130,
		},
		{
			title: '创建时间',
			minWidth: 120,
			dataKey: 'createTime',
		},
	]

	/**
	 * 搜索入参
	 */
	const form = reactive({
		// 左侧部门树的id
		deptId: '',
		nickname: '',
		email: '',
		status: '',
		current: pagination.currentPage,
		size: pagination.pageSize,
	})

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

	/**
	 * 列表数据加载
	 */
	function onSearch() {
		loading.value = true
		getUserList(form)
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
	 * 打开新增、修改框
	 * @param title 新增/修改
	 * @param row 用户数据
	 */
	const openUpdatePanel = (title = '新增', row?: FindBasicUserResponse) => {
		openDrawer({
			title: `${title}用户`,
			bodyPadding: 20,
			confirmLoading: true,
			props: {
				formInline: row,
			},
			size: 620,
			content: () => h(UpdateUserForm, { ref: formRef }),
			onConfirm: (close, closeLoading) => {
				const updateFormRef = formRef.value?.getRef()
				const formData = formRef.value?.getData()?.value

				function chores() {
					ElMessage({
						type: 'success',
						message: `您${title}了用户名称为${formData.nickname}的这条数据`,
					})
					close() // 关闭弹框
					onSearch() //
				}

				updateFormRef.validate((valid: unknown) => {
					if (valid) {
						// console.log("curData", curData);
						// 表单规则校验通过
						if (title === '新增') {
							// chores();
							insertBasicUser(formData)
								.then(() => {
									chores()
								})
								.finally(() => closeLoading())
						} else {
							// chores();
							updateBasicUser(formData)
								.then(() => {
									chores()
								})
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
	const handleDelete = (row: FindBasicUserResponse) => {
		removeBasicUserById(row.id).then(() => {
			onSearch()
			ElMessage({
				type: 'success',
				message: `您删除了用户编号为${row.id}的这条数据`,
			})
		})
	}

	/**
	 * 上传文件
	 * @param file 文件
	 * @param row 行数据
	 * @param updateData 是否同时上传数据
	 */
	const handleUpload = (file: File, row: FindBasicUserResponse, updateData: boolean = true) => {
		const bucket: string = 'user-picture'
		const minioBaseUrl = import.meta.env.VITE_MINIO_BASE_URL
		// 剪切后的图片blob
		const imageBlob = ref()
		openDialog({
			title: '裁剪、上传头像',
			width: '900px',
			props: {
				modelValue: file,
			},
			destroyOnClose: true,
			confirmLoading: true,
			content: h(ImageCropper, { 'onUpdate:blob': (blob) => (imageBlob.value = blob) }),
			onConfirm: (close, closeLoading) => {
				if (!imageBlob.value) return

				// 头像预签名
				const fileName = file.name
				const splits = fileName.split('.')
				const name = splits[0] + '.' + crypto.randomUUID() + '.' + splits[1]
				uploadPreSigned({ name, bucket })
					.then((res) => {
						// 使用预签名URL上传
						uploadByPreSignedUrl(res.url, imageBlob.value, file.type)
							.then(() => {
								row.picture = minioBaseUrl + '/' + res.bucket + '/' + res.name
								if (updateData) {
									// 执行修改
									updateBasicUser(row as SaveBasicUserRequest)
										.then(() => {
											ElMessage({
												type: 'success',
												message: '头像上传成功.',
											})
											close() // 关闭弹框
											onSearch() // 刷新表格数据
										})
										.finally(() => closeLoading())
								} else {
									close() // 关闭弹框
								}
							})
							.catch(() => closeLoading())
							.finally(() => {
								if (!updateData) {
									// 不修改数据时不管是否正常都关闭loading
									closeLoading()
								}
							})
					})
					.catch(() => closeLoading())
			},
		})
		return false
	}

	/**
	 * 重置用户密码
	 * @param row 用户数据
	 */
	const handleReset = (row: FindBasicUserResponse) => {
		const formInline = {
			password: '',
		}
		openDialog({
			title: `重置 ${row.username} 用户的密码`,
			width: '30%',
			props: {
				formInline: formInline,
			},
			destroyOnClose: true,
			confirmLoading: true,
			content: h(ResetPassword),
			onConfirm: (close, closeLoading) => {
				if (!formInline.password) {
					ElMessage({
						type: 'error',
						message: `新密码不能为空`,
					})
					closeLoading()
					return
				}
				if (!row.id) {
					ElMessage({
						type: 'error',
						message: `用户数据异常，id为空`,
					})
					return
				}
				resetPassword({
					userId: row.id,
					password: formInline.password,
				})
					.then(() => {
						ElMessage({
							type: 'success',
							message: `已成功重置 ${row.username} 用户的密码`,
						})
						close()
					})
					.finally(() => closeLoading())
			},
			onCancel() {
				formInline.password = ''
			},
		})
	}

	/**
	 * 用户角色设置
	 * @param row 用户数据
	 */
	const handleUserRoles = (row: FindBasicUserResponse) => {
		const formInline = {
			userId: row.id,
			allRoles: allRoles.value,
			userRoles: [],
		}
		openDialog({
			title: `分配 ${row.username} 用户的角色`,
			width: '595px',
			props: {
				formInline,
			},
			cancelText: '关闭',
			destroyOnClose: true,
			confirmLoading: true,
			content: h(UserRoles),
			onConfirm: (close, closeLoading) => {
				if (!formInline.userId) {
					ElMessage({
						type: 'error',
						message: '数据异常，用户id为空',
					})
					return
				}
				updateUserRoles({
					userId: formInline.userId,
					roleIds: formInline.userRoles,
				})
					.then(() => {
						ElMessage({
							type: 'success',
							message: `用户 ${row.nickname} 的角色分配成功.`,
						})
					})
					.finally(() => closeLoading())
			},
		})
	}

	onMounted(() => {
		onSearch()

		// 角色列表
		getAllRoleList().then((roles) => (allRoles.value = roles))
	})

	return {
		form,
		loading,
		columns,
		dataList,
		onSearch,
		pagination,
		handleReset,
		handleDelete,
		handleUpload,
		openUpdatePanel,
		handleUserRoles,
		handleSizeChange,
		handleCurrentChange,
		handleSelectionChange,
	}
}
