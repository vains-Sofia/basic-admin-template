<script setup lang="ts">
import { ref } from 'vue'
import IconSelect from '@/components/IconSelect'

const icon = ref('')
</script>

<template>
	<div>
		<div class="p-5 mb-2" style="background-color: var(--el-bg-color)">
		<IconSelect v-model="icon" :page-size="200" />
		</div>
		<div class="p-5 flex" style="background-color: var(--el-bg-color)">
			<span>已选图标：</span><Icon :icon="icon" width="24" /> <span class="ml-1">{{ icon }}</span>
		</div>
	</div>
</template>
