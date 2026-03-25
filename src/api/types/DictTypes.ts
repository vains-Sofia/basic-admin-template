import { StatusEnum } from '@/api/types/Enums.ts'

export interface FindSysDictItemResponse {
	/** 字典项的唯一标识符 */
	id: string;

	/** 字典项所属的字典类型代码 */
	typeCode: string;

	/** 字典项的键，用于标识该字典项 */
	itemCode: string;

	/** 字典项的值，用于描述该字典项 */
	itemName: string;

	/** 字典项的排序值，用于控制显示顺序 */
	sortOrder: number;

	/** 字典项的状态（Y=启用，N=禁用） */
	status: "Y" | "N";

	/** 字典项的多语言支持 JSON 字符串 */
	i18nJson: string;

	/** 创建该字典项的用户ID */
	createBy: string;

	/** 创建该字典项的用户姓名 */
	createName: string;

	/** 字典项的创建时间 */
	createTime: string;

	/** 最后修改该字典项的用户ID */
	updateBy: string;

	/** 最后修改该字典项的用户姓名 */
	updateName: string;

	/** 字典项的最后修改时间 */
	updateTime: string;
}

export interface FindSysDictTypeResponse {
	/** 字典类型ID，字典类型的唯一标识符 */
	id: string;

	/** 字典类型代码，用于标识不同的字典类型 */
	typeCode: string;

	/** 字典类型名称，用于描述该字典类型 */
	name: string;

	/** 字典类型描述，对字典类型的详细描述 */
	description: string;

	/** 状态，状态（Y=启用，N=禁用） */
	status: "Y" | "N";

	/** 创建人，创建该字典类型的用户ID */
	createBy: number;

	/** 创建人姓名，创建该字典类型的用户姓名 */
	createName: string;

	/** 创建时间，字典类型的创建时间 */
	createTime: string;

	/** 修改人，最后修改该字典类型的用户ID */
	updateBy: number;

	/** 修改人姓名，最后修改该字典类型的用户姓名 */
	updateName: string;

	/** 修改时间，字典类型的最后修改时间 */
	updateTime: string;
}

/**
 * 字典项请求参数
 *
 * 用于创建或更新字典项的请求参数对象。
 * @author vains
 */
export interface SysDictItemRequest {
	/**
	 * 字典类型编码（字典类型的唯一编码）
	 * @required
	 */
	typeCode: string;

	/**
	 * 字典项编码（唯一键，用于标识字典项）
	 * 最大长度：50
	 * @required
	 */
	itemCode: string;

	/**
	 * 字典项名称（用户可见的描述信息）
	 * 最大长度：100
	 * @required
	 */
	itemName: string;

	/**
	 * 排序序号
	 * 默认值：0
	 */
	sortOrder?: number;

	/**
	 * 状态（Y=启用，N=禁用）
	 * 默认值：StatusEnum.ENABLE
	 */
	status?: StatusEnum;

	/**
	 * 多语言 JSON 值，通常是一个 JSON 字符串
	 */
	i18nJson?: string;
}
