export const staticRoutes = [
	{
		path: '/login',
		name: 'Login',
		meta: { title: '登录', icon: 'ep:house', hidden: true },
		component: () => import('@/views/login/Index.vue'),
	},
	{
		path: '/',
		name: 'Home',
		redirect: '/dashboard',
		meta: { title: '首页', icon: 'ep:house' },
		component: () => import('@/components/Layout/index.vue'),
		children: [
			{
				path: '/dashboard',
				name: 'Dashboard',
				component: () => import('@/views/dashboard/Index.vue'),
				meta: { title: '首页', icon: 'ep:house' },
			},
		],
	},
]
