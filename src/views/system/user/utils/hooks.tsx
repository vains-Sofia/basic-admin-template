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
import { generateUUID } from '@/utils/Common.ts'
import { buildMinioObjectPath, buildMinioUrl, stripMinioBaseUrl } from '@/utils/minio.ts'

const USER_PICTURE_BUCKET = 'user-picture'
const PENDING_UPLOADS = Symbol('pendingUploads')

type PendingUpload = {
	file: File
	blob: Blob
	previewUrl: string
	bucket: string
	fileType: string
}

type UserPendingUploads = {
	picture?: PendingUpload
}

type UserUploadTarget = (FindBasicUserResponse | SaveBasicUserRequest) & {
	[PENDING_UPLOADS]?: UserPendingUploads
}

function getUploadExtension(fileType: string) {
	const extension = fileType.split('/').pop()?.split(';')[0] || 'png'
	return extension === 'jpeg' ? 'jpg' : extension
}

function buildUploadName(fileName: string, fileType: string) {
	const splits = fileName.split('.')
	if (splits.length > 1) {
		splits.pop()
	}
	const baseName = splits.join('.') || 'image'
	return `${baseName}.${generateUUID()}.${getUploadExtension(fileType)}`
}

function getPendingUploads(row: UserUploadTarget) {
	if (!row[PENDING_UPLOADS]) {
		Object.defineProperty(row, PENDING_UPLOADS, {
			value: {},
			enumerable: false,
			configurable: true,
		})
	}
	return row[PENDING_UPLOADS]!
}

function revokePendingUpload(pending?: PendingUpload) {
	if (pending?.previewUrl) {
		URL.revokeObjectURL(pending.previewUrl)
	}
}

function setPendingPicture(row: UserUploadTarget, pending: PendingUpload) {
	const uploads = getPendingUploads(row)
	revokePendingUpload(uploads.picture)
	uploads.picture = pending
	row.picture = pending.previewUrl
}

async function uploadPendingImage(pending: PendingUpload) {
	const res = await uploadPreSigned({
		name: buildUploadName(pending.file.name, pending.fileType),
		bucket: pending.bucket,
	})
	await uploadByPreSignedUrl(res.url, pending.blob, pending.fileType)
	return buildMinioObjectPath(res.bucket, res.name)
}

async function flushUserPendingUploads(row: UserUploadTarget) {
	const uploads = row[PENDING_UPLOADS]
	if (!uploads?.picture) return

	const picture = await uploadPendingImage(uploads.picture)
	row.picture = picture
	revokePendingUpload(uploads.picture)
	delete uploads.picture
}

function disposeUserPendingUploads(row?: UserUploadTarget) {
	const uploads = row?.[PENDING_UPLOADS]
	if (!uploads) return

	revokePendingUpload(uploads.picture)
	delete uploads.picture
}

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

	const userPictures = () => {
		return dataList.value.filter((e) => !!e && !!e.picture).map((e) => buildMinioUrl(e.picture))
	}

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
					src={buildMinioUrl(picture)}
					initial-index={userPictures().indexOf(buildMinioUrl(picture))}
					preview-teleported={true}
					preview-src-list={userPictures()}
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
				const formData = formRef.value?.getData()?.value as UserUploadTarget

				function chores() {
					ElMessage({
						type: 'success',
						message: `您${title}了用户名称为${formData.nickname}的这条数据`,
					})
					close() // 关闭弹框
					onSearch() //
				}

				updateFormRef.validate(async (valid: unknown) => {
					if (!valid) {
						closeLoading()
						return
					}

					try {
						await flushUserPendingUploads(formData)
						formData.picture = stripMinioBaseUrl(formData.picture)
						if (title === '新增') {
							await insertBasicUser(formData as SaveBasicUserRequest)
						} else {
							await updateBasicUser(formData as SaveBasicUserRequest)
						}
						chores()
					} catch {
						ElMessage.error('图片上传或用户保存失败，请重试')
					} finally {
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

	const handleAvatarSelect = (file: File, row: UserUploadTarget) => {
		const imageBlob = ref<Blob>()
		openDialog({
			title: '裁剪头像',
			width: '900px',
			props: {
				modelValue: file,
			},
			destroyOnClose: true,
			confirmLoading: true,
			content: h(ImageCropper, { 'onUpdate:blob': (blob: Blob) => (imageBlob.value = blob) }),
			onConfirm: (close, closeLoading) => {
				if (!imageBlob.value) {
					ElMessage.warning('请先完成图片裁剪')
					closeLoading()
					return
				}

				const blob = imageBlob.value
				setPendingPicture(row, {
					file,
					blob,
					previewUrl: URL.createObjectURL(blob),
					bucket: USER_PICTURE_BUCKET,
					fileType: blob.type || file.type || 'image/png',
				})
				close()
			},
		})
		return false
	}

	const handleInlineAvatarUpload = (file: File, row: FindBasicUserResponse) => {
		const imageBlob = ref<Blob>()
		openDialog({
			title: '裁剪头像',
			confirmText: '保存头像',
			width: '900px',
			props: {
				modelValue: file,
			},
			destroyOnClose: true,
			confirmLoading: true,
			content: h(ImageCropper, { 'onUpdate:blob': (blob: Blob) => (imageBlob.value = blob) }),
			onConfirm: async (close, closeLoading) => {
				if (!imageBlob.value) {
					ElMessage.warning('请先完成图片裁剪')
					closeLoading()
					return
				}

				const blob = imageBlob.value
				const pending: PendingUpload = {
					file,
					blob,
					previewUrl: URL.createObjectURL(blob),
					bucket: USER_PICTURE_BUCKET,
					fileType: blob.type || file.type || 'image/png',
				}

				try {
					const picture = await uploadPendingImage(pending)
					await updateBasicUser({ ...(row as SaveBasicUserRequest), picture })
					row.picture = picture
					ElMessage.success('头像上传成功.')
					close()
					onSearch()
				} catch {
					ElMessage.error('头像上传失败，请重试')
					closeLoading()
				} finally {
					revokePendingUpload(pending)
				}
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
		handleAvatarSelect,
		handleInlineAvatarUpload,
		disposeUserPendingUploads,
		openUpdatePanel,
		handleUserRoles,
		handleSizeChange,
		handleCurrentChange,
		handleSelectionChange,
	}
}
