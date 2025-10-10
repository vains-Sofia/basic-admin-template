import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useDark } from '@vueuse/core'

export const useLayoutStore = defineStore('Layout', () => {
	// 是否为黑暗模式
	const isDark = useDark()

	// 深色菜单
	const darkMenu = ref(true)

	// 菜单是否折叠
	const menuCollapse = ref(false)

	// 菜单宽度
	const menuWidth = computed(() => (menuCollapse.value ? 64 : 230))

	// 左侧菜单栏背景色
	const menuBackgroundColor = ref('var(--el-menu-bg-color)')

	// 改变菜单折叠的状态
	function toggleMenuCollapse() {
		menuCollapse.value = !menuCollapse.value
	}

	// 改变菜单折叠的状态
	function toggleDarkMenu() {
		darkMenu.value = !darkMenu.value
	}

	/**
	 * 切换黑暗模式
	 * @param event 鼠标点击事件
	 */
	const toggleDark = (event: MouseEvent = {} as MouseEvent) => {

		// 获取到 transition API 实例
		const transition = document.startViewTransition(() => {
			isDark.value = !isDark.value
		})

		// 在 transition.ready 的 Promise 完成后，执行自定义动画
		transition.ready.then(() => {
			// 由于我们要从鼠标点击的位置开始做动画，所以我们需要先获取到鼠标的位置
			const { clientX, clientY } = event

			// 计算半径，以鼠标点击的位置为圆心，到四个角的距离中最大的那个作为半径
			const radius = Math.hypot(
				Math.max(clientX, innerWidth - clientX),
				Math.max(clientY, innerHeight - clientY),
			)
			const clipPath = [
				`circle(0% at ${clientX}px ${clientY}px)`,
				`circle(${radius}px at ${clientX}px ${clientY}px)`,
			]
			// 自定义动画
			document.documentElement.animate(
				{
					// 如果要切换到暗色主题，我们在过渡的时候从半径 100% 的圆开始，到 0% 的圆结束
					clipPath: isDark.value ? clipPath.reverse() : clipPath,
				},
				{
					duration: 500,
					fill: "both",
					// 如果要切换到暗色主题，我们应该裁剪 view-transition-old(root) 的内容
					pseudoElement: isDark.value
						? '::view-transition-old(root)'
						: '::view-transition-new(root)',
				},
			)
		})
	}

	return {
		isDark,
		darkMenu,
		menuWidth,
		toggleDark,
		menuCollapse,
		toggleDarkMenu,
		toggleMenuCollapse,
		menuBackgroundColor,
	}
})
