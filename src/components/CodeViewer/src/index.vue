<script setup lang="ts">
import { computed } from 'vue'

interface Props {
	code: string
	height?: string
	language?: string
}
const props = defineProps<Props>()

// 高度，默认 70vh
const maxHeight = computed(() => props.height || '70vh')
// 自动添加语言 class
const computedClass = computed(() => (props.language ? `language-${props.language}` : ''))
</script>

<template>
	<div class="code-viewer overflow-auto" :style="{ maxHeight }" v-highlight>
		<pre><code :class="computedClass" class="!whitespace-pre-wrap">{{ code }}</code></pre>
	</div>
</template>

<style scoped></style>
