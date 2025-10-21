<template>
	<div class="bounce-text">
		<span v-for="(char, i) in textArray" :key="i" :style="{ '--i': i }">
			{{ char === ' ' ? '\u00A0' : char }}
		</span>
	</div>
</template>

<script setup lang="ts">
const {
	text = '',
	color = 'var(--el-text-color)',
	size = '48px',
	shadow = false,
} = defineProps<{
	text: string
	color?: string
	size?: string
	shadow?: boolean
}>()
const textArray = text.split('')

const shadowCss = shadow ? '2px 2px 8px rgba(0, 0, 0, 0.2)' : 'none'
const shadowCss1 = shadow ? '4px 4px 12px rgba(0, 212, 255, 0.6)' : 'none'
const shadowCss2 = shadow ? '3px 3px 12px rgba(125, 252, 255, 0.5)' : 'none'
</script>

<style scoped>
:root {
	--i: 0;
}

.bounce-text {
	display: flex;
	gap: 2px;
	font-weight: bold;
	font-size: v-bind(size);
	color: v-bind(color);
	text-shadow: v-bind(shadowCss);
}

.bounce-text span {
	display: inline-block;
	animation: bounce 0.8s ease-in-out forwards;
	animation-delay: calc(var(--i) * 0.1s);
}

@keyframes bounce {
	0%,
	100% {
		transform: translateY(0) scale(1);
		text-shadow: v-bind(shadowCss);
	}
	20% {
		transform: translateY(-20px) scale(1.2);
		text-shadow: v-bind(shadowCss1);
	}
	40% {
		transform: translateY(0) scale(1.1);
		text-shadow: v-bind(shadowCss2);
	}
	60% {
		transform: translateY(-12px) scale(1.15);
		text-shadow: v-bind(shadowCss2);
	}
	80% {
		transform: translateY(0) scale(1);
		text-shadow: v-bind(shadowCss);
	}
}
</style>
