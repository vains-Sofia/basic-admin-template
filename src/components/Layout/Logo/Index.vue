<script setup lang="ts">
import BounceText from '@/components/BounceText'
import { useLayoutStore } from '@/stores/Layout'

const layoutStore = useLayoutStore()
</script>

<template>
	<div class="logo-container" :class="layoutStore.darkMenu ? 'dark' : 'light'">
		<img src="@/assets/logo.png" class="logo-image" alt="Vue logo" />
<!--		<div v-if="!layoutStore.menuCollapse" class="logo-text">Basic Cloud</div>-->
		<BounceText
			v-if="!layoutStore.menuCollapse"
			size="16px"
			text="Basic Cloud"
			style="color: var(--el-text-color); font-family: 'Playfair Display', serif"
		/>
	</div>
</template>

<style scoped lang="scss">
.logo-container {
	display: flex;
	cursor: pointer;
	align-items: center;
	color: var(--el-menu-text-color);
	height: var(--layout-navbar-height);
	background-color: var(--el-menu-bg-color);
	border-right: 1px solid var(--el-menu-border-color);

	.logo-image {
		height: 2em;
		margin-left: 17px;
		margin-right: 17px;
		will-change: filter;
		transition:
			filter 300ms,
			transform 300ms;

		&:hover {
			transform: scale(1.08);
			filter: drop-shadow(0 0 2em #00ffff) drop-shadow(0 0 1em #00ffff);
		}
	}

	.logo-text {
		overflow: hidden;
		text-overflow: ellipsis;
		transition: var(--el-transition-all);
	}
}
</style>
