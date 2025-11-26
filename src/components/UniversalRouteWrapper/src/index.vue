<script setup lang="ts">
import { useRoute } from 'vue-router'
import { RouterView } from 'vue-router'
import { computed } from 'vue'

const props = defineProps<{
	path: string,
	component: any,
}>()

const route = useRoute()

// 组件是否与当前路由匹配
const lastPage = computed(() => route.path.endsWith(props.path))
</script>

<template>
	<div>
		<!-- 自定义组件包装实际的组件，组件内决定是展示当前页面还是通过RouterView渲染子级 -->
		<component :is="lastPage ? props.component : RouterView" />
	</div>
</template>
