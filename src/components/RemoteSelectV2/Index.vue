<template>
	<el-select-v2
		v-bind="$attrs"
		v-model="innerValue"
		:options="options"
		:loading="loading"
		:remote="true"
		:remote-method="debouncedSearch"
		filterable
		:scrollbar-always-on="true"
		@scroll="handleScroll"
		@change="$emit('update:modelValue', innerValue)"
	/>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useDebounce } from "@/hooks/useDebounce";

const props = defineProps({
	modelValue: [String, Number, Object],
	fetchFunction: {
		type: Function,
		required: true
	},
	labelKey: {
		type: String,
		default: "name"
	},
	valueKey: {
		type: String,
		default: "id"
	},
	pageSize: {
		type: Number,
		default: 20
	},
	labelFormatter: {
		type: Function,
		default: null
	}
});

defineEmits(["update:modelValue"]);

const innerValue = ref(props.modelValue);
watch(
	() => props.modelValue,
	val => (innerValue.value = val)
);

const options = ref<any[]>([]);
const loading = ref(false);
const page = ref(1);
const searchKeyword = ref("");
const total = ref(Infinity);
const loadedTotal = ref(0);
const hasLoaded = ref(false);

const loadData = async (isReset = false) => {
	if (loading.value) return;
	loading.value = true;

	try {
		const param = {
			current: page.value,
			size: props.pageSize,
			keyword: searchKeyword.value || ""
		};

		// 防止 fetchFunction(undefined) 导致解构报错
		const result = await props.fetchFunction(param || {});

		const records = result?.records ?? [];
		const totalFromApi = result?.total ?? null;

		const newOptions = records.map((item: Record<string, any>) => ({
			label: props.labelFormatter
				? props.labelFormatter(item)
				: item[props.labelKey],
			value: item[props.valueKey]
		}));

		if (isReset) {
			options.value = newOptions;
			loadedTotal.value = newOptions.length;
		} else {
			options.value.push(...newOptions);
			loadedTotal.value += newOptions.length;
		}

		if (totalFromApi !== null) total.value = totalFromApi;
	} catch (err) {
		console.warn("加载失败", err);
	} finally {
		loading.value = false;
	}
};

const handleRemoteSearch = async (keyword = "") => {
	searchKeyword.value = keyword;
	page.value = 1;
	total.value = Infinity;
	// await loadData(true);
	if (!hasLoaded.value || keyword) {
		await loadData(true);
		if (!keyword) {
			hasLoaded.value = true;
		}
	}
};

const handleScroll = async (e: any) => {
	const el = e.target;
	if (el.scrollHeight - el.scrollTop <= el.clientHeight + 5) {
		if (loading.value || loadedTotal.value >= total.value) return;
		page.value++;
		await loadData(false);
	}
};

const debouncedSearch = useDebounce(
	(keyword = "") => handleRemoteSearch(keyword),
	300
);

loadData(true);
</script>
