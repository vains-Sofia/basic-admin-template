export const menuData: any[] = [
	{
		path: '/components',
		meta: {
			title: '组件',
			icon: 'ep:menu',
		},
		children: [
			{
				path: 'qrcode',
				name: 'qrcode',
				component: '/components/QrCode',
				meta: {
					title: '二维码',
					icon: 'material-symbols:qr-code',
				},
			},
			{
				path: 'layout',
				name: 'layout',
				component: '/components/LayoutFunction',
				meta: {
					icon: 'ep:promotion',
					title: '布局功能',
				},
			},
			{
				path: 'table',
				name: 'table',
				component: '/components/SmartTable',
				meta: {
					icon: 'material-symbols:table-outline-sharp',
					title: '表格',
				},
			},
			{
				path: 'tableV2',
				name: 'tableV2',
				component: '/components/SmartTableV2',
				meta: {
					icon: 'material-symbols:table-view-outline-sharp',
					title: '虚拟表格',
				},
			},
			{
				path: 'dialog',
				name: 'dialog',
				component: '/components/Dialog',
				meta: {
					icon: 'material-symbols:chat-outline',
					title: 'Dialog对话框',
				},
			},
			{
				path: 'drawer',
				name: 'drawer',
				component: '/components/Drawer',
				meta: {
					icon: 'material-symbols:bottom-drawer-outline',
					title: 'Drawer抽屉',
				},
			},
		],
	},
]
