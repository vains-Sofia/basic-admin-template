<script setup lang="ts">
import { Breadcrumb } from '../index'
import { useUserStore } from '@/stores/User'
import { useLayoutStore } from '@/stores/Layout'
import SidebarSearch from '../Sidebar/SidebarSearch.vue'
import { ref } from 'vue'
import TextTooltip from '@/components/TextTooltip/src'

const userStore = useUserStore()
const layoutStore = useLayoutStore()

const searchVisible = ref(false)
</script>

<template>
	<div>
		<div class="navbar">
			<div class="navbar-items">
				<div></div>
				<el-icon
					:size="20"
					class="navbar-item navbar-icon"
					@click="layoutStore.toggleMenuCollapse()"
				>
					<Icon v-if="!layoutStore.menuCollapse" icon="ep:fold" />
					<Icon v-else icon="ep:expand" />
				</el-icon>
				<Breadcrumb class="navbar-item" />
			</div>

			<div class="navbar-items">
				<el-icon :size="16" class="navbar-item navbar-icon" @click="searchVisible = true">
					<Icon icon="ep:search" @click="searchVisible = true" />
				</el-icon>
				<el-icon :size="16" class="navbar-item navbar-icon" @click="layoutStore.toggleDark">
					<Icon v-if="layoutStore.isDark" icon="ep:sunny" color="#FCD34D" />
					<Icon v-else icon="ep:moon" color="#374151" />
				</el-icon>
				<!--			<Icon icon="ep:search" class="navbar-icon" @click="searchVisible = true" />-->
				<div class="navbar-item avatar-item">
					<el-dropdown>
						<span class="flex items-center gap-2">
							<el-avatar shape="square" size="small" :src="userStore.picture" />
							<span>
								<TextTooltip placement="left" :content="userStore.nickname" max-width="120px">
									{{ userStore.nickname }}
								</TextTooltip>
							</span>
						</span>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item>
									<el-icon>
										<Icon icon="ep:user" />
									</el-icon>
									个人信息
								</el-dropdown-item>
								<el-dropdown-item @click="userStore.logout">
									<el-icon>
										<Icon icon="ep:opportunity" />
									</el-icon>
									退出登录
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
			</div>
		</div>
		<el-dialog
			v-model="searchVisible"
			:show-close="false"
			width="40%"
			style="padding: 0"
			destroy-on-close
		>
			<SidebarSearch
				:menu-data="userStore.getRouters()"
				@select="() => (searchVisible = false)"
			/>
		</el-dialog>
	</div>
</template>

<style scoped>
.navbar {
	display: flex;
	justify-content: space-between;
	height: var(--layout-navbar-height);
	border-bottom: 1px solid var(--el-menu-border-color);
}
.navbar-items {
	gap: 20px;
	display: flex;
	align-items: center;
}
.navbar-items:last-child {
	margin-right: 30px;
}

.navbar-icon {
	cursor: pointer;
	vertical-align: middle;
	/* width: var(--layout-navbar-height); */
}

.navbar-item {
	height: 100%;
	display: flex;
	cursor: pointer;
}

.el-avatar {
	width: 22px;
	height: 22px;
	cursor: pointer;
	background-color: transparent;
}

.avatar-item {
	align-items: center;
	text-align: center;
}
</style>
