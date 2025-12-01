<script setup lang="ts">
</script>

<template>
	<el-main class="layout-main-content !p-0">
		<el-scrollbar>
			<router-view v-slot="{ Component, route }">
				<transition
					name="fade"
					mode="out-in"
					class="fadeIn"
					enter-active-class="animate__animated animate__fadeIn"
					leave-active-class="animate__animated animate__fadeOut"
				>
					<component :is="Component" :key="route.path" />
				</transition>
			</router-view>
		</el-scrollbar>
	</el-main>
	<el-footer class="layout-main-content layout-footer !bg-[var(--el-bg-color)] !p-1">
		Copyright © 2025-present Vains All Rights Reserved.
	</el-footer>
</template>

<style scoped>
.layout-main-content {
	overflow: hidden;
	background: var(--el-bg-color-page);
}
.layout-footer {
	width: 100%;
	height: auto;
	font-size: 14px;
	text-align: center;
	border-top: 1px solid var(--el-border-color-lighter);
}
</style>
