<script setup lang="ts">
import { ref } from 'vue'
import IconSelect from '@/components/IconSelect'

const icon = ref('')
const visible = ref(false)
</script>

<template>
	<div>
		<div class="p-5 mb-2" style="background-color: var(--el-bg-color)">
			<el-button @click="visible = true">选择图标</el-button>
			<el-dialog v-model="visible" title="选择图标" width="450px">
				<IconSelect v-model="icon" />

				<template #footer>
					<el-button @click="visible = false">关闭</el-button>
				</template>
			</el-dialog>
		</div>

		<div class="p-5 flex" style="background-color: var(--el-bg-color)">
			<span>已选图标：</span><Icon :icon="icon" width="24" /> <span class="ml-1">{{ icon }}</span>
		</div>
	</div>
</template>
