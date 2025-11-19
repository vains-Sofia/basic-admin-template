import {
	defineComponent,
	nextTick,
	onBeforeUnmount,
	onMounted,
	type PropType,
	ref,
	watch,
} from 'vue'
import Cropper, { CropperImage } from 'cropperjs'
import { Icon } from '@iconify/vue'

/**
 * 边界判断 类型定义
 */
interface SelectionType {
	x: number
	y: number
	width: number
	height: number
}

export default defineComponent({
	name: 'ImageCropper',
	props: {
		// 裁剪框宽度
		width: { type: Number, default: 300 },
		// 裁剪框高度
		height: { type: Number, default: 300 },
		// 生成图片的质量
		quality: { type: Number, default: 0.92 },
		// 裁剪框比例
		aspectRatio: { type: Number as PropType<number | undefined>, default: undefined },
		// 传入的图片 文件/URL
		modelValue: { type: [String, File] as PropType<string | File>, default: '' },
	},
	emits: ['update:blob', 'update:url', 'update:modelValue'],
	setup(props, { emit }) {
		const containerRef = ref<HTMLDivElement | null>(null)
		const imgRef = ref<HTMLImageElement | null>(null)
		const fileInputRef = ref<HTMLInputElement | null>(null)
		const previewUrl = ref<string>('')
		const rawUrl = ref('')

		let cropper: Cropper | null = null

		// 初始化
		const initCropper = async () => {
			if (!imgRef.value || !containerRef.value) return
			// 等 img 加载
			await nextTick()

			// 清空旧的 cropper
			if (cropper) {
				cropper.destroy()
				cropper = null
			}

			// 构造新的 Cropper
			cropper = new Cropper(imgRef.value, {
				container: containerRef.value,
			})

			// 设置canvas样式
			cropper.getCropperCanvas?.()?.$addStyles(
				`
				  :host {
					height: ${props.height + 100}px;
				  }
				`,
			)

			cropper.getCropperImage?.()?.$ready(() => {
				const ima = cropper?.getCropperImage?.();
				if (ima) {
					// 居中
					ima.$center()
					ima.skewable = true
					ima.$image.height = props.height + 50
				}
				const sel = cropper?.getCropperSelection?.()
				if (sel) {
					// selection初始值
					sel.width = props.width
					sel.height = props.height
					sel.movable = true
					sel.outlined = true
					sel.zoomable = true
					sel.aspectRatio = props.aspectRatio ?? 1
					sel.initialAspectRatio = props.aspectRatio ?? 1
					sel.$center()
				}
				zoomOut()

				const elements = containerRef.value?.getElementsByTagName('cropper-handle');
				if (elements && elements.length) {
					for (const handle of elements) {
						if (handle.getAttribute('action') === 'select') {
							handle.setAttribute('action', 'move')
						}
					}
				}
			})

			// 等待 ready 完成
			imgRef.value.addEventListener('load', () => {
				updatePreview()
			})
		}

		const updatePreview = () => {
			if (!cropper) return

			// v2: 用 selection 元素的 toCanvas 方法
			const sel = cropper.getCropperSelection?.()
			const canvas = sel?.$toCanvas({
				width: props.width,
				height: props.height,
			})
			if (!canvas) return

			canvas.then((canvasElement) => {
				if (!canvasElement) return
				canvasElement.toBlob(
					(blob) => {
						if (!blob) return
						const url = URL.createObjectURL(blob)
						previewUrl.value = url
						emit('update:blob', blob)
						emit('update:url', url)
					},
					'image/png',
					props.quality,
				)
			})
		}

		/**
		 * 当被裁剪图片放大、缩小时，阻止裁剪框超出边界(被裁剪图片边界)
		 * @param e 事件
		 */
		const onTransformChange = (e?: CustomEvent) => {
			if (!cropper || !e) return

			const cropperImage = cropper.getCropperImage();
			const cropperSelection = cropper.getCropperSelection();
			const cropperCanvas = cropper.getCropperCanvas()

			if (!cropperCanvas || !cropperImage || !cropperSelection) return
			const cropperCanvasRect = cropperCanvas.getBoundingClientRect();

			// 1. Clone the cropper image.
			const cropperImageClone = cropperImage.cloneNode() as CropperImage;

			// 2. Apply the new matrix to the cropper image clone.
			if (e.detail.matrix) {
				cropperImageClone.style.transform = `matrix(${e.detail.matrix.join(', ')})`;
			}

			// 3. Make the cropper image clone invisible.
			cropperImageClone.style.opacity = '0';

			// 4. Append the cropper image clone to the cropper canvas.
			cropperCanvas.appendChild(cropperImageClone);

			// 5. Compute the boundaries of the cropper image clone.
			const cropperImageRect = cropperImageClone.getBoundingClientRect();

			// 6. Remove the cropper image clone.
			cropperCanvas.removeChild(cropperImageClone);

			const selection: SelectionType = {
				x: cropperSelection.x,
				y: cropperSelection.y,
				width: cropperSelection.width,
				height: cropperSelection.height,
			};
			const maxSelection: SelectionType = {
				x: cropperImageRect.left - cropperCanvasRect.left,
				y: cropperImageRect.top - cropperCanvasRect.top,
				width: cropperImageRect.width,
				height: cropperImageRect.height,
			};

			if (!inSelection(selection, maxSelection)) {
				e.preventDefault();
			}
		}

		/**
		 * 当裁剪框变化时，阻止裁剪框超出边界(被裁剪图片边界)
		 * @param e 事件
		 */
		const onSelectionChange = (e?: CustomEvent) => {
			if (!cropper || !e) return
			const cropperImage = cropper.getCropperImage();
			const cropperCanvas = cropper.getCropperCanvas()

			if (!cropperCanvas || !cropperImage) return
			const cropperCanvasRect = cropperCanvas.getBoundingClientRect();

			const cropperImageRect = cropperImage.getBoundingClientRect();
			const maxSelection: SelectionType = {
				x: cropperImageRect.left - cropperCanvasRect.left,
				y: cropperImageRect.top - cropperCanvasRect.top,
				width: cropperImageRect.width,
				height: cropperImageRect.height,
			};

			const selection = e.detail as SelectionType;
			if (!inSelection(selection, maxSelection)) {
				e.preventDefault();
			}
		}

		/**
		 * 裁剪框是否在边界(maxSelection)中
		 * @param selection 裁剪框坐标、宽高
		 * @param maxSelection 边界坐标、宽高
		 */
		const inSelection = (selection: SelectionType, maxSelection: SelectionType) => {
			return (
				selection.x >= maxSelection.x
				&& selection.y >= maxSelection.y
				&& (selection.x + selection.width) <= (maxSelection.x + maxSelection.width)
				&& (selection.y + selection.height) <= (maxSelection.y + maxSelection.height)
			);
		}

		/**
		 * 当图片变化时，响应变更
		 * @param e 事件
		 */
		const handleFileChange = (e: Event) => {
			const input = e.target as HTMLInputElement
			const file = input.files?.[0]
			if (!file) return

			emit('update:modelValue', file)
		}

		/**
		 * 打开文件选择(模拟file input点击)
		 */
		const openFile = () => {
			fileInputRef.value?.click()
		}

		/**
		 * 放大
		 */
		const zoomIn = () => {
			cropper?.getCropperImage()?.$zoom(0.05)
			updatePreview()
		}

		/**
		 * 缩小
		 */
		const zoomOut = () => {
			cropper?.getCropperImage()?.$zoom(-0.05)
			updatePreview()
		}

		/**
		 * 左旋转90°
		 */
		const rotateLeft = () => {
			cropper?.getCropperImage()?.$rotate('-90deg')
			updatePreview()
		}

		/**
		 * 右旋转90°
		 */
		const rotateRight = () => {
			cropper?.getCropperImage()?.$rotate('90deg')
			updatePreview()
		}

		/**
		 * 左右翻转
		 */
		const flipX = () => {
			cropper?.getCropperImage()?.$scale(-1, 1)
			updatePreview()
		}

		/**
		 * 上下翻转
		 */
		const flipY = () => {
			cropper?.getCropperImage()?.$scale(1, -1)
			updatePreview()
		}

		onMounted(() => {
			// 初始无图，不做 init
		})

		onBeforeUnmount(() => {
			cropper?.destroy()
			cropper = null
		})

		// watch rawUrl，如果用户选了新图，重新初始化
		watch(
			() => props.modelValue,
			(value) => {
				if (!value) return;
				if (value instanceof File) {
					rawUrl.value = URL.createObjectURL(value)
				} else {
					rawUrl.value = value
				}
				nextTick().then(initCropper)
			},
			{ immediate: true }
		)

		return () => (
			<div style={{ display: 'flex', gap: '16px' }}>
				{/* 左边：裁剪区 */}
				<div
					ref={containerRef}
					{...({ onAction: updatePreview } as any)}
					{...({ onTransform: onTransformChange } as any)}
					onChange={onSelectionChange}
					style={{
						flex: 1,
						position: 'relative',
						border: '1px solid var(--cropper-border, #ddd)',
						background: 'var(--cropper-background, #fff)',
					}}
				>
					<img alt={''} ref={imgRef} src={rawUrl.value} />
					{/* 工具栏 */}
					<div
						style={{
							position: 'absolute',
							top: '10px',
							left: '10px',
							display: 'flex',
							gap: '8px',
							padding: '6px 8px',
							borderRadius: '8px',
							background: 'var(--cropper-toolbar-bg, rgba(0,0,0,0.4))',
							backdropFilter: 'blur(6px)',
						}}
					>
						<button onClick={openFile} style={{ color: 'white', cursor: 'pointer' }}>
							<Icon icon="ep:upload" />
						</button>
						<button onClick={zoomIn} style={{ color: 'white', cursor: 'pointer' }}>
							<Icon icon="ep:zoom-in" />
						</button>
						<button onClick={zoomOut} style={{ color: 'white', cursor: 'pointer' }}>
							<Icon icon="ep:zoom-out" />
						</button>
						<button onClick={rotateLeft} style={{ color: 'white', cursor: 'pointer' }}>
							<Icon icon="ep:refresh-left" />
						</button>
						<button onClick={rotateRight} style={{ color: 'white', cursor: 'pointer' }}>
							<Icon icon="ep:refresh-right" />
						</button>
						<button onClick={flipX} style={{ color: 'white', cursor: 'pointer' }}>
							<Icon icon="ep:switch" />
						</button>
						<button onClick={flipY} style={{ color: 'white', cursor: 'pointer' }}>
							<Icon icon="ep:sort" />
						</button>
					</div>
				</div>

				{/* 右边：预览 + 上传 */}
				<div style={{ width: '260px' }}>
					<h4 style={{ color: 'var(--cropper-text, #333)' }}>裁剪预览</h4>
					<div
						style={{
							border: '1px solid var(--cropper-border, #ddd)',
							padding: '8px',
							background: 'var(--cropper-background, #fff)',
						}}
					>
						{previewUrl.value ? (
							<img
								alt={'CropperPreview'}
								src={previewUrl.value}
								style={{ width: '100%', borderRadius: '4px' }}
							/>
						) : (
							<div
								style={{
									textAlign: 'center',
									color: 'var(--cropper-text-muted, #999)',
									padding: '40px 0',
								}}
							>
								无预览
							</div>
						)}
					</div>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						style={{ display: 'none' }}
						onChange={handleFileChange}
					/>
				</div>
			</div>
		)
	},
})
