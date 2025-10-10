import QRCodeStyling, { type Options } from 'qr-code-styling'
import { defineComponent, onBeforeUnmount, onMounted, type Ref, ref, watch } from 'vue'
import type { FileExtension } from 'qr-code-styling/lib/types'
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'

export default defineComponent({
	name: 'QrCode',
	props: {
		/** 二维码数据 */
		data: { type: String, required: true },
		/** 尺寸 */
		size: { type: Number, default: 300 },
		/** logo 图片 */
		image: { type: String, default: '' },
		/** logo 图片 */
		imageSize: { type: Number, default: 0.2 },
		/** 点样式类型 */
		dotsType: { type: String, default: 'square' }, // square | dots | rounded 等
		/** 角块样式 */
		cornersSquareType: { type: String, default: undefined },
		/** 角点样式 */
		cornersDotType: { type: String, default: '' },
		/** 背景色 */
		background: { type: String, default: '#ffffff' },
		/** 点颜色 */
		dotsColor: { type: String, default: '#000000' },
		// 是否显示下载按钮
		showDownload: { type: Boolean, default: false },
	},
	setup(props) {
		const containerRef = ref<HTMLElement>()
		let qrCode: QRCodeStyling | null = null

		// 初始化
		onMounted(() => {
			qrCode = new QRCodeStyling({
				width: props.size,
				height: props.size,
				data: props.data,
				image: props.image || undefined,
				imageOptions: {
					imageSize: props.imageSize,
				},
				dotsOptions: {
					roundSize: true,
					color: props.dotsColor,
					type: 'square',
				},
				cornersSquareOptions: {
					type: props.cornersSquareType,
				},
				cornersDotOptions: {
					type: props.cornersDotType,
				},
				backgroundOptions: {
					color: props.background,
				},
				qrOptions: {
					typeNumber: 0,
					errorCorrectionLevel: 'Q',
				},
			} as Options)
			if (containerRef.value) {
				qrCode.append(containerRef.value)
			}
		})

		// 监听 props 更新二维码
		watch(
			() => [
				props.data,
				props.size,
				props.image,
				props.dotsColor,
				props.dotsType,
				props.cornersSquareType,
				props.cornersDotType,
				props.background,
			],
			() => {
				if (qrCode) {
					qrCode.update({
						width: props.size,
						height: props.size,
						data: props.data,
						image: props.image || undefined,
						imageOptions: {
							imageSize: props.imageSize,
						},
						dotsOptions: {
							color: props.dotsColor,
							type: props.dotsType as any,
						},
						cornersSquareOptions: {
							type: props.cornersSquareType as any,
						},
						cornersDotOptions: {
							type: props.cornersDotType as any,
						},
						backgroundOptions: {
							color: props.background,
						},
					} as Options)
				}
			},
			{ deep: true },
		)

		onBeforeUnmount(() => {
			// 可选：销毁处理
			qrCode = null
		})

		// 选择后缀事件
		const downloadExtension: Ref<FileExtension> = ref('svg');
		const handlerCommand = (command: string) => {
			downloadExtension.value = command as FileExtension
		}

		// 提供导出方法（父组件通过 ref 调用）
		const download = (fileName = 'qrcode') => {
			qrCode?.download({ name: fileName, extension: downloadExtension.value })
		}

		return () => (
			<div style={`width: ${props.size}px;text-align: center;`}>
				<div ref={containerRef}></div>
				{props.showDownload && (
					<ElDropdown split-button onClick={() => download()} show-arrow={false} onCommand={handlerCommand}>
						{{
							default: () => <span>下载 {downloadExtension.value}</span>,
							dropdown: () => (
								<ElDropdownMenu>
									<ElDropdownItem command="svg">svg</ElDropdownItem>
									<ElDropdownItem command="png">png</ElDropdownItem>
									<ElDropdownItem command="jpeg">jpeg</ElDropdownItem>
									<ElDropdownItem command="webp">webp</ElDropdownItem>
								</ElDropdownMenu>
							),
						}}
					</ElDropdown>
				)}
			</div>
		)
	},
})
