import { defineStore } from 'pinia'
import { type Ref, ref, type VNode } from 'vue'
import { type DialogProps, type DrawerProps } from 'element-plus'

/**
 * 基础插件配置
 */
interface BasicOptions {
	// 唯一标识
	id?: string
	// 是否开启确认按钮点击后变为加载中
	confirmLoading?: boolean
	// 确认按钮文字
	confirmText?: string
	// 取消按钮文字
	cancelText?: string
	// 内容
	content: string | VNode | (() => VNode | Comment) | Comment
	// 确认事件，入参close：关闭弹窗，入参closeLoading：关闭加载按钮
	onConfirm?: (close: () => void, closeLoading: () => void) => void | Promise<void>
	// 取消事件
	onCancel?: () => void
	// 传给content组件的值
	props?: any
}

/**
 * Dialog配置
 */
export interface DialogOptions extends Partial<DialogProps>, BasicOptions {}

/**
 * Drawer配置
 */
export interface DrawerOptions extends Partial<DrawerProps>, BasicOptions {
	// 抽屉Body padding的值，优先级高
	bodyPadding?: number
}

export const usePluginStore = defineStore('Plugins', () => {
	// 要显示的Dialog
	const dialogs: Ref<DialogOptions[]> = ref([])

	// 要显示的Drawer
	const drawers: Ref<DrawerOptions[]> = ref([])

	/**
	 * 开启一个dialog
	 * @param options dialog配置
	 */
	function openDialog(options: DialogOptions) {
		dialogs.value = dialogs.value.filter((d) => d.modelValue)
		const id = options.id ?? Date.now().toString()
		dialogs.value.push({ ...options, id, modelValue: true })
		return id
	}

	/**
	 * 根据id关闭dialog
	 * @param id dialog的id
	 */
	function closeDialog(id: string | undefined) {
		const index = dialogs.value.findIndex((d) => d.id === id)
		dialogs.value[index] = { ...dialogs.value[index], modelValue: false }
	}

	/**
	 * 关闭所有的dialog
	 */
	function clearDialogs() {
		dialogs.value = []
	}

	/**
	 * 打开一个Drawer抽屉
	 * @param options Drawer抽屉配置
	 */
	function openDrawer(options: DrawerOptions) {
		drawers.value = drawers.value.filter((d) => d.modelValue)
		const id = options.id ?? Date.now().toString()
		const withHeader = !!options.title
		const bodyClass = `${options.bodyClass ?? ``} drawer-body-padding`
		drawers.value.push({ ...options, id, modelValue: true, withHeader, bodyClass })
		return id
	}

	/**
	 * 根据id关闭dialog
	 * @param id dialog的id
	 */
	function closeDrawer(id: string | undefined) {
		const index = drawers.value.findIndex((d) => d.id === id)
		drawers.value[index] = { ...drawers.value[index], modelValue: false }
	}

	/**
	 * 关闭所有的dialog
	 */
	function clearDrawers() {
		drawers.value = []
	}

	return {
		dialogs,
		openDialog,
		closeDialog,
		clearDialogs,
		drawers,
		openDrawer,
		closeDrawer,
		clearDrawers,
	}
})
