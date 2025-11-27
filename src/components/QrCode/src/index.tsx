import QRCodeStyling, { type Options } from 'qr-code-styling'
import {
	defineComponent,
	onBeforeUnmount,
	onMounted,
	type PropType,
	type Ref,
	ref,
	watch,
} from 'vue'
import type { FileExtension } from 'qr-code-styling/lib/types'
import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElButton, ElIcon } from 'element-plus'
import Loading from '~icons/ep/loading'
import './qr-code.css'

export default defineComponent({
	name: 'QrCode',

	props: {
		data: { type: String, required: true },
		size: { type: Number, default: 300 },
		image: { type: String, default: '' },
		imageSize: { type: Number, default: 0.2 },
		dotsType: { type: String, default: 'square' },
		cornersSquareType: { type: String, default: undefined },
		cornersDotType: { type: String, default: '' },
		background: { type: String, default: '#ffffff' },
		dotsColor: { type: String, default: '#000000' },
		showDownload: { type: Boolean, default: false },

		/** 新增: 失效蒙版 */
		expired: { type: Boolean, default: false },
		onRefresh: { type: Function as PropType<() => void>, default: null },

		/** 新增: loading 蒙版 */
		loading: { type: Boolean, default: false },

		/** loading文字 */
		loadingText: { type: String, default: '加载中...' },

		/** 新增: 是否启用二维码淡入效果 */
		transition: { type: Boolean, default: false },
	},

	setup(props, { slots }) {
		const containerRef = ref<HTMLElement>()
		let qrCode: QRCodeStyling | null = null

		/** 控制二维码淡入动画 */
		const isReady = ref(false)

		onMounted(() => {
			qrCode = new QRCodeStyling({
				width: props.size,
				height: props.size,
				data: props.data,
				image: props.image || undefined,
				imageOptions: { imageSize: props.imageSize },
				dotsOptions: { color: props.dotsColor, type: props.dotsType as any },
				cornersSquareOptions: { type: props.cornersSquareType as any },
				cornersDotOptions: { type: props.cornersDotType as any },
				backgroundOptions: { color: props.background },
				qrOptions: { typeNumber: 0, errorCorrectionLevel: 'Q' },
			})

			if (containerRef.value) {
				qrCode.append(containerRef.value)

				/** 小延迟触发淡入动画 */
				if (props.transition) {
					requestAnimationFrame(() => {
						isReady.value = true
					})
				} else {
					isReady.value = true
				}
			}
		})

		/** 更新二维码 */
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
					isReady.value = false // 更新时先隐藏，更新后再淡入

					qrCode.update({
						width: props.size,
						height: props.size,
						data: props.data,
						image: props.image || undefined,
						imageOptions: { imageSize: props.imageSize },
						dotsOptions: { color: props.dotsColor, type: props.dotsType as any },
						cornersSquareOptions: { type: props.cornersSquareType as any },
						cornersDotOptions: { type: props.cornersDotType as any },
						backgroundOptions: { color: props.background },
					} as Options)

					if (props.transition) {
						requestAnimationFrame(() => {
							isReady.value = true
						})
					} else {
						isReady.value = true
					}
				}
			},
			{ deep: true },
		)

		onBeforeUnmount(() => {
			qrCode = null
		})

		/** 下载 */
		const downloadExtension: Ref<FileExtension> = ref('svg')
		const handlerCommand = (command: string) =>
			(downloadExtension.value = command as FileExtension)
		const download = (fileName = 'qrcode') =>
			qrCode?.download({ name: fileName, extension: downloadExtension.value })

		return () => (
			<div class="qr-wrapper" style={`width:${props.size}px;`}>
				<div
					class={[
						'qr-container',
						props.transition ? 'qr-fade' : '',
						isReady.value ? 'qr-fade-in' : 'qr-fade-out',
					]}
					style={`width:${props.size}px;height:${props.size}px;`}
				>
					<div ref={containerRef}></div>

					{/* loading 蒙版 */}
					{props.loading && (
						<div class="qr-mask qr-loading-mask">
							{slots.loading ? (
								slots.loading()
							) : (
								<div class="qr-loading-content">
									<ElIcon class="qr-loading-icon" size={22}>
										<Loading />
									</ElIcon>
									<div class="qr-loading-text">{props.loadingText}</div>
								</div>
							)}
						</div>
					)}

					{/* 失效蒙版 */}
					{props.expired && !props.loading && (
						<div class="qr-mask">
							{slots.expired ? (
								slots.expired()
							) : (
								<div class="qr-mask-content">
									<div class="qr-mask-text">二维码已失效</div>
									{props.onRefresh && (
										<ElButton
											type="primary"
											size="small"
											link
											onClick={props.onRefresh}
										>
											重新获取
										</ElButton>
									)}
								</div>
							)}
						</div>
					)}
				</div>

				{props.showDownload && (
					<ElDropdown
						split-button
						onClick={() => download()}
						show-arrow={false}
						onCommand={handlerCommand}
					>
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
