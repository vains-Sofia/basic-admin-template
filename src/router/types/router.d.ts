// 定义路由中meta的属性
import 'vue-router'

declare module 'vue-router' {
	interface RouteMeta {
		// 标题
		title: string
		// 图标
		icon?: string
		// 图标颜色
		iconColor?: string
		// 是否隐藏
		hidden?: boolean
		// 标记某个菜单项"不显示子菜单"，即使它有子菜单也当作叶子节点处理。
		noShowingChildren?: boolean
		// 强制显示父级菜单，即使只有一个子菜单也显示为子菜单结构。
		showParent?: boolean

		// 固定标签页
		fixedTag?: boolean
		// 不在标签页展示
		hiddenTag?: boolean
		// 排序序号
		rank?: number
	}
}

export {}
