import { h, onMounted, reactive, ref } from 'vue'
import type { TableColumn, TablePagination } from '@/components/SmartTable'
import { openDrawer } from '@/components/CommonDrawer'
import { openDialog } from '@/components/CommonDialog'
import { ImageCropper } from '@/components/ImageCropper'
import { uploadByPreSignedUrl, uploadPreSigned } from '@/api/system/Common.ts'
import { createStore, deleteStore, pageStore, updateStore } from '@/api/dine/Store.ts'
import type { FindStoreResponse, StoreRequest } from '@/api/types/StoreTypes.ts'
import { StatusEnum } from '@/api/types/Enums.ts'
import StoreUpdateForm from '@/views/dine/store/form/StoreUpdateForm.vue'
import { generateUUID } from '@/utils/Common.ts'
import { buildMinioObjectPath, buildMinioUrl, stripMinioBaseUrl } from '@/utils/minio.ts'

type UploadTarget = 'logo' | 'albums'

const STORE_LOGO_BUCKET = 'store-logo'
const STORE_ALBUM_BUCKET = 'store-album'
const PENDING_UPLOADS = Symbol('pendingUploads')

type PendingUpload = {
	file: File
	blob: Blob
	previewUrl: string
	bucket: string
	fileType: string
}

type StorePendingUploads = {
	logo?: PendingUpload
	albums?: Record<string, PendingUpload>
	initialAlbums?: string[]
	removedAlbums?: Set<string>
}

type StoreUploadTarget = StoreRequest & {
	[PENDING_UPLOADS]?: StorePendingUploads
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

function getPendingUploads(row: StoreUploadTarget) {
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

function setPendingLogo(row: StoreUploadTarget, pending: PendingUpload) {
	const uploads = getPendingUploads(row)
	revokePendingUpload(uploads.logo)
	uploads.logo = pending
	row.logo = pending.previewUrl
}

function initStoreAlbums(row: StoreUploadTarget) {
	const uploads = getPendingUploads(row)
	uploads.initialAlbums = [...(row.albums ?? [])]
	uploads.removedAlbums = new Set()
}

function addPendingAlbum(row: StoreUploadTarget, pending: PendingUpload) {
	const uploads = getPendingUploads(row)
	uploads.albums = uploads.albums ?? {}
	uploads.albums[pending.previewUrl] = pending
	row.albums = [...(row.albums ?? []), pending.previewUrl]
}

async function uploadPendingImage(pending: PendingUpload) {
	const res = await uploadPreSigned({
		name: buildUploadName(pending.file.name, pending.fileType),
		bucket: pending.bucket,
	})
	await uploadByPreSignedUrl(res.url, pending.blob, pending.fileType)
	return buildMinioObjectPath(res.bucket, res.name)
}

async function flushStorePendingUploads(row: StoreUploadTarget) {
	const uploads = row[PENDING_UPLOADS]
	if (!uploads) return

	if (uploads.logo) {
		row.logo = await uploadPendingImage(uploads.logo)
		revokePendingUpload(uploads.logo)
		delete uploads.logo
	}

	if (uploads.albums) {
		const currentAlbums = row.albums ?? []
		const uploadedMap = new Map<string, string>()
		for (const album of currentAlbums) {
			const pendingAlbum = uploads.albums[album]
			if (pendingAlbum) {
				uploadedMap.set(album, await uploadPendingImage(pendingAlbum))
				revokePendingUpload(pendingAlbum)
				delete uploads.albums[album]
			}
		}

		const initialAlbums = uploads.initialAlbums ?? []
		const removedAlbums = uploads.removedAlbums ?? new Set<string>()
		const retainedInitialAlbums = initialAlbums.filter(
			(album) => !removedAlbums.has(album) && !uploadedMap.has(album),
		)
		const currentRemoteAlbums = currentAlbums.filter((album) => !uploads.albums?.[album])
		row.albums = Array.from(
			new Set([
				...retainedInitialAlbums,
				...currentRemoteAlbums.map((album) => uploadedMap.get(album) ?? album),
			]),
		)
	}
}

function removePendingAlbum(row: StoreUploadTarget, url: string) {
	const uploads = getPendingUploads(row)
	const pending = uploads.albums?.[url]
	if (pending) {
		revokePendingUpload(pending)
		delete uploads.albums?.[url]
		return
	}

	uploads.removedAlbums = uploads.removedAlbums ?? new Set()
	uploads.removedAlbums.add(url)
}

function disposeStorePendingUploads(row?: StoreUploadTarget) {
	const uploads = row?.[PENDING_UPLOADS]
	if (!uploads) return

	revokePendingUpload(uploads.logo)
	Object.values(uploads.albums ?? {}).forEach(revokePendingUpload)
	delete uploads.logo
	delete uploads.albums
	delete uploads.initialAlbums
	delete uploads.removedAlbums
}

export function useStore(loadOnMounted = true) {
	const switchLoadMap = ref<Record<string, boolean>>({})
	const loading = ref(true)
	const formRef = ref<InstanceType<typeof StoreUpdateForm>>()
	const dataList = ref<FindStoreResponse[]>([])
	const pagination = reactive<TablePagination>({
		total: 0,
		pageSize: 10,
		currentPage: 1,
	})

	const storeLogos = () =>
		dataList.value.filter((item) => !!item.logo).map((item) => buildMinioUrl(item.logo))
	const storeAlbums = () =>
		dataList.value.flatMap((item) => item.albums?.map(buildMinioUrl) ?? [])

	const form = reactive({
		keyword: '',
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
			title: '门店 Logo',
			dataKey: 'logo',
			align: 'center',
			width: 120,
			formatter: ({ logo, name }) =>
				logo ? (
					<ElImage
						fit="cover"
						src={buildMinioUrl(logo)}
						initial-index={storeLogos().indexOf(buildMinioUrl(logo))}
						preview-teleported={true}
						preview-src-list={storeLogos()}
						class="w-[64px] h-[64px] rounded align-middle"
					/>
				) : (
					<ElAvatar shape={'square'} size={64}>
						{name?.slice(0, 1)}
					</ElAvatar>
				),
		},
		{
			title: '门店名称',
			dataKey: 'name',
			align: 'left',
			minWidth: 150,
			showOverflowTooltip: true,
		},
		{
			title: '门店地址',
			dataKey: 'address',
			align: 'left',
			minWidth: 180,
			showOverflowTooltip: true,
		},
		{
			title: '经纬度',
			dataKey: 'location',
			align: 'center',
			minWidth: 180,
			formatter: ({ longitude, latitude }) =>
				longitude && latitude ? `${longitude}, ${latitude}` : '-',
		},
		{
			title: '商家相册',
			dataKey: 'albums',
			align: 'center',
			width: 150,
			formatter: ({ albums }) =>
				albums?.length ? (
					<div class="flex justify-center items-center gap-1">
						{albums.slice(0, 3).map((album: string) => (
							<ElImage
								key={album}
								fit="cover"
								src={buildMinioUrl(album)}
								initial-index={storeAlbums().indexOf(buildMinioUrl(album))}
								preview-teleported={true}
								preview-src-list={storeAlbums()}
								class="w-[36px] h-[36px] rounded align-middle"
							/>
						))}
						{albums.length > 3 ? (
							<ElTag size="small">+{albums.length - 3}</ElTag>
						) : null}
					</div>
				) : (
					'-'
				),
		},
		{
			title: '营业时间',
			dataKey: 'businessHours',
			align: 'left',
			minWidth: 130,
			showOverflowTooltip: true,
		},
		{
			title: '门店描述',
			dataKey: 'description',
			align: 'left',
			minWidth: 160,
			showOverflowTooltip: true,
		},
		{
			title: '状态',
			dataKey: 'status',
			formatter: (row: FindStoreResponse) => (
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

	function beforeChange(row: FindStoreResponse): Promise<boolean> {
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

	function onChange(row: FindStoreResponse) {
		const id = row.id
		switchLoadMap.value[id] = true
		updateStore(id, pickStoreForm(row))
			.then(() => {
				ElMessage.success('已成功修改门店状态')
				onSearch()
			})
			.finally(() => (switchLoadMap.value[id] = false))
	}

	function pickStoreForm(row: StoreRequest): StoreRequest {
		return {
			name: row.name,
			logo: stripMinioBaseUrl(row.logo),
			status: row.status,
			address: row.address,
			longitude: row.longitude,
			latitude: row.latitude,
			albums: row.albums?.map(stripMinioBaseUrl) ?? [],
			businessHours: row.businessHours,
			description: row.description,
		}
	}

	function onSearch() {
		loading.value = true
		pageStore(form)
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

	const openUpdatePanel = (title = '新增', row?: FindStoreResponse) => {
		openDrawer({
			title: `${title}门店`,
			bodyPadding: 20,
			confirmLoading: true,
			size: 720,
			props: {
				formInline: row,
			},
			content: () => <StoreUpdateForm ref={formRef} />,
			onConfirm(close, closeLoading) {
				const updateFormRef = formRef.value?.getRef()
				const formData = formRef.value?.getData()?.value as StoreUploadTarget & {
					id?: string
				}

				function chores() {
					ElMessage({
						type: 'success',
						message: `您${title}了门店名称为${formData.name}的这条数据`,
					})
					close()
					onSearch()
				}

				updateFormRef.validate(async (valid: unknown) => {
					if (!valid) {
						closeLoading()
						return
					}

					try {
						await flushStorePendingUploads(formData)
						const data = pickStoreForm(formData)
						if (title === '新增') {
							await createStore(data)
						} else {
							await updateStore(formData.id!, data)
						}
						chores()
					} catch {
						ElMessage.error('图片上传或门店保存失败，请重试')
					} finally {
						closeLoading()
					}
				})
			},
		})
	}

	function handleDelete(row: FindStoreResponse) {
		deleteStore(row.id).then(() => {
			ElMessage({
				type: 'success',
				message: `您删除了门店名称为${row.name}的这条数据`,
			})
			onSearch()
		})
	}

	const handleStoreImageSelect = (
		file: File,
		row: StoreUploadTarget,
		target: UploadTarget = 'logo',
	) => {
		const imageBlob = ref<Blob>()

		openDialog({
			title: target === 'logo' ? '裁剪门店 Logo' : '裁剪商家相册',
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
				const pending: PendingUpload = {
					file,
					blob,
					previewUrl: URL.createObjectURL(blob),
					bucket: target === 'logo' ? STORE_LOGO_BUCKET : STORE_ALBUM_BUCKET,
					fileType: blob.type || file.type || 'image/png',
				}

				if (target === 'logo') {
					setPendingLogo(row, pending)
				} else {
					addPendingAlbum(row, pending)
				}
				close()
			},
		})

		return false
	}

	onMounted(() => {
		if (loadOnMounted) {
			onSearch()
		} else {
			loading.value = false
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
		handleStoreImageSelect,
		initStoreAlbums,
		removePendingAlbum,
		disposeStorePendingUploads,
		openUpdatePanel,
		handleSizeChange,
		handleCurrentChange,
		handleSelectionChange,
	}
}
