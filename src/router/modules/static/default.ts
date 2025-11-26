export default [
	{
		path: '/login',
		name: 'Login',
		meta: { title: '登录', icon: 'ep:house' },
		component: () => import('@/views/login/Index.vue'),
	},
	{
		path: '/tools',
		name: 'tools',
		meta: { title: '工具集', icon: 'ep:house' },
		children: [
			{
				path: 'video',
				name: 'video',
				meta: {
					title: '视频提取',
					icon: 'ep:house'
				},
				component: () => import('@/views/tools/ExtractVideo.vue'),
			}
		]
	},
	{
		path: '/',
		name: 'Home',
		redirect: '/dashboard',
		meta: { title: '首页', icon: 'ep:house', showLink: true },
		component: () => import('@/components/Layout/index.vue'),
		children: [
			{
				path: '/dashboard',
				name: 'Dashboard',
				component: () => import('@/views/dashboard/Index.vue'),
				meta: { title: '首页', icon: 'ep:house', fixedTag: true, showLink: true  },
			},
		],
	},
	{
		path: '/',
		name: 'Error',
		meta: { title: '错误页', icon: 'ep:folder-delete', showLink: true },
		component: () => import('@/components/Layout/index.vue'),
		children: [
			{
				path: '404',
				name: '404',
				component: () => import('@/views/error/404.vue'),
				meta: { title: '404', icon: 'ep:circle-close', showLink: true },
			},
		],
	},
]
