export const menuData: any[] = [
	{
		path: '/components',
		meta: {
			title: '组件',
			icon: 'ep:menu',
			showLink: true
		},
		children: [
			{
				path: 'qrcode',
				name: 'qrcode',
				component: '/components/QrCode',
				meta: {
					title: '二维码',
					icon: 'material-symbols:qr-code',
					showLink: true
				},
			},
			{
				path: 'layout',
				name: 'layout',
				component: '/components/LayoutFunction',
				meta: {
					icon: 'ep:promotion',
					title: '布局功能',
					showLink: true
				},
			},
			{
				path: 'table',
				name: 'table',
				component: '/components/SmartTable',
				meta: {
					icon: 'material-symbols:table-outline-sharp',
					title: '表格',
					showLink: true
				},
			},
			{
				path: 'tableV2',
				name: 'tableV2',
				component: '/components/SmartTableV2',
				meta: {
					icon: 'material-symbols:table-view-outline-sharp',
					title: '虚拟表格',
					showLink: true
				},
			},
			{
				path: 'dialog',
				name: 'dialog',
				component: '/components/Dialog',
				meta: {
					icon: 'material-symbols:chat-outline',
					title: 'Dialog对话框',
					showLink: true
				},
			},
			{
				path: 'drawer',
				name: 'drawer',
				component: '/components/Drawer',
				meta: {
					icon: 'material-symbols:bottom-drawer-outline',
					title: 'Drawer抽屉',
					showLink: true
				},
			},
			{
				path: 'cropper',
				name: 'Cropper',
				component: '/components/Cropper',
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
					icon: 'ep:house',
					showLink: true
				},
				component: 'components/IconSelect1',
			},
			{
				path: 'iconSelect2',
				name: 'iconSelect2',
				meta: {
					title: '图标选择器2',
					icon: 'ep:house',
					showLink: true
				},
				component: '/components/IconSelect2',
			},
		],
	},
]
