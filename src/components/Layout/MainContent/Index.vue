<script setup lang="ts">
</script>

<template>
	<el-main class="layout-main-content">
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
	<el-footer class="layout-main-content layout-footer">
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
}
</style>
