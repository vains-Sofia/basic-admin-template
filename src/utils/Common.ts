/**
 * 根据传入列名和顺序对对象数组排序
 * @param arr 原始数组
 * @param key 排序列名
 * @param order 排序顺序 'asc' | 'desc'
 * @returns 排序后的新数组
 */
export function sortByKey<T extends Record<string, unknown>>(
	arr: T[],
	key: keyof T,
	order: 'asc' | 'desc' = 'asc'
): T[] {
	return [...arr].sort((a, b) => {
		const valA = a[key] as unknown;
		const valB = b[key] as unknown;

		// 处理 undefined/null
		if (valA == null && valB == null) return 0;
		if (valA == null) return order === 'asc' ? 1 : -1;
		if (valB == null) return order === 'asc' ? -1 : 1;

		// 类型检查
		const isNumA = typeof valA === 'number';
		const isNumB = typeof valB === 'number';

		if (isNumA && isNumB) {
			return order === 'asc'
				? (valA) - (valB)
				: (valB) - (valA);
		}

		// 统一转为字符串比较
		return order === 'asc'
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			? String(valA).localeCompare(String(valB))
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			: String(valB).localeCompare(String(valA));
	});
}
