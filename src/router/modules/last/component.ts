export default [
	{
		path: '/components',
		meta: {
			title: '组件',
			icon: 'ep:menu',
			showLink: true
		},
		component: () => import('@/components/Layout/index.vue'),
		children: [
			{
				path: 'qrcode',
				name: 'qrcode',
				component: () => import('@/views/components/QrCode.vue'),
				meta: {
					title: '二维码',
					icon: 'material-symbols:qr-code',
					showLink: true
				},
			},
			{
				path: 'layout',
				name: 'layout',
				component: () => import('@/views/components/LayoutFunction.vue'),
				meta: {
					icon: 'ep:promotion',
					title: '布局功能',
					showLink: true
				},
			},
			{
				path: 'table',
				name: 'table',
				component: () => import('@/views/components/SmartTable.vue'),
				meta: {
					icon: 'material-symbols:table-outline-sharp',
					title: '表格',
					showLink: true
				},
			},
			{
				path: 'tableV2',
				name: 'tableV2',
				component: () => import('@/views/components/SmartTableV2.vue'),
				meta: {
					icon: 'material-symbols:table-view-outline-sharp',
					title: '虚拟表格',
					showLink: true
				},
			},
			{
				path: 'dialog',
				name: 'dialog',
				component: () => import('@/views/components/Dialog.vue'),
				meta: {
					icon: 'material-symbols:chat-outline',
					title: 'Dialog对话框',
					showLink: true
				},
			},
			{
				path: 'drawer',
				name: 'drawer',
				component: () => import('@/views/components/Drawer.vue'),
				meta: {
					icon: 'material-symbols:bottom-drawer-outline',
					title: 'Drawer抽屉',
					showLink: true
				},
			},
			{
				path: 'cropper',
				name: 'Cropper',
				component: () => import('@/views/components/Cropper.vue'),
				meta: {
					title: '图片剪裁',
					icon: 'material-symbols:crop',
					showLink: true,
				},
			},
			{
				path: 'iconSelect',
				name: 'iconSelect',
				meta: {
					title: '图标选择器1',
					icon: 'fa7-solid:navicon',
					showLink: true
				},
				component: () => import('@/views/components/IconSelect1.vue'),
			},
			{
				path: 'iconSelect2',
				name: 'iconSelect2',
				meta: {
					title: '图标选择器2',
					icon: 'fa7-solid:navicon',
					showLink: true
				},
				component: () => import('@/views/components/IconSelect2.vue'),
			},
			{
				path: 'FormDesigner',
				name: 'FormDesigner',
				meta: {
					title: '表单设计器',
					icon: 'ri:file-list-line',
					showLink: true
				},
				component: () => import('@/views/components/FormDesigner.vue'),
			},
			{
				path: 'FormDesignerExample',
				name: 'FormDesignerExample',
				meta: {
					title: '动态表单示例',
					icon: 'ri:file-list-line',
					showLink: true
				},
				component: () => import('@/views/components/FormDesignerExample.vue'),
			}
		],
	},
]
