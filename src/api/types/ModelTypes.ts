export type Result<T> = {
	success: boolean;
	message: string;
	code: number;
	data?: T;
};

export interface Pageable<T> {
	/** 列表数据 */
	records: Array<T>;
	/** 总条目数 */
	total: number;
	/** 每页显示条目个数 */
	size: number;
	/** 当前页数 */
	current: number;
}

export interface PageableRequest {
	/** 每页显示条目个数 */
	size?: number;
	/** 当前页数 */
	current?: number;
}
