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

type UploadTarget = 'logo' | 'albums'

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

	const storeLogos = () => dataList.value.filter((item) => !!item.logo).map((item) => item.logo)
	const storeAlbums = () => dataList.value.flatMap((item) => item.albums ?? [])

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
						src={logo}
						initial-index={storeLogos().indexOf(logo)}
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
								src={album}
								initial-index={storeAlbums().indexOf(album)}
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
			logo: row.logo,
			status: row.status,
			address: row.address,
			longitude: row.longitude,
			latitude: row.latitude,
			albums: row.albums ?? [],
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
				const formData = formRef.value?.getData()?.value

				function chores() {
					ElMessage({
						type: 'success',
						message: `您${title}了门店名称为${formData.name}的这条数据`,
					})
					close()
					onSearch()
				}

				updateFormRef.validate((valid: unknown) => {
					if (valid) {
						const data = pickStoreForm(formData)
						if (title === '新增') {
							createStore(data)
								.then(() => chores())
								.finally(() => closeLoading())
						} else {
							updateStore(formData.id, data)
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

	function handleDelete(row: FindStoreResponse) {
		deleteStore(row.id).then(() => {
			ElMessage({
				type: 'success',
				message: `您删除了门店名称为${row.name}的这条数据`,
			})
			onSearch()
		})
	}

	const handleUpload = (
		file: File,
		row: StoreRequest,
		updateData = true,
		target: UploadTarget = 'logo',
	) => {
		const bucket = target === 'logo' ? 'store-logo' : 'store-album'
		const minioBaseUrl = import.meta.env.VITE_MINIO_BASE_URL
		const imageBlob = ref()

		openDialog({
			title: target === 'logo' ? '裁剪、上传门店 Logo' : '裁剪、上传商家相册',
			width: '900px',
			props: {
				modelValue: file,
			},
			destroyOnClose: true,
			confirmLoading: true,
			content: h(ImageCropper, { 'onUpdate:blob': (blob) => (imageBlob.value = blob) }),
			onConfirm: (close, closeLoading) => {
				if (!imageBlob.value) return

				const fileName = file.name
				const splits = fileName.split('.')
				const extension = splits.length > 1 ? splits.pop() : 'png'
				const name = `${splits.join('.')}.${generateUUID()}.${extension}`
				uploadPreSigned({ name, bucket })
					.then((res) => {
						uploadByPreSignedUrl(res.url, imageBlob.value, file.type)
							.then(() => {
								const url = `${minioBaseUrl}/${res.bucket}/${res.name}`
								if (target === 'logo') {
									row.logo = url
								} else {
									row.albums = [...(row.albums ?? []), url]
								}

								if (updateData) {
									updateStore((row as FindStoreResponse).id, pickStoreForm(row))
										.then(() => {
											ElMessage({
												type: 'success',
												message: '门店图片上传成功',
											})
											close()
											onSearch()
										})
										.finally(() => closeLoading())
								} else {
									close()
								}
							})
							.catch(() => closeLoading())
							.finally(() => {
								if (!updateData) {
									closeLoading()
								}
							})
					})
					.catch(() => closeLoading())
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
		handleUpload,
		openUpdatePanel,
		handleSizeChange,
		handleCurrentChange,
		handleSelectionChange,
	}
}
