<script setup lang="ts">
import { ipAddress } from '@/api/Test'
import { useLayoutStore } from '@/stores/Layout'

const LayoutStore = useLayoutStore()

const testHttpRequest = () => {
	ipAddress().then((res) => {
		console.log(res)
	})
}

</script>

<template>
	<div>
		<el-button plain @click="LayoutStore.toggleDark">暗黑模式切换</el-button>
		<el-button plain @click="LayoutStore.toggleMenuCollapse()">切换菜单展开折叠状态</el-button>
		<el-button plain @click="testHttpRequest">发起请求</el-button>
		<el-button plain @click="LayoutStore.toggleDarkMenu()">深色浅色菜单切换</el-button>
		<el-button plain @click="LayoutStore.toggleDarkMenu()">深色浅色菜单切换</el-button>
	</div>
</template>

<style scoped></style>
