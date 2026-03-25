/**
 * 性别枚举
 */
export enum GenderEnum {
	UNKNOWN = '0',
	MALE = '1',
	FEMALE = '2',
	UNDISCLOSED = '9',
}

/**
 * 菜单类型枚举
 */
export enum PermissionTypeEnum {
	MENU = 0,
	BUTTON = 1,
	EXTERNAL_LINK = 2,
	REST = 3,
}

/**
 * 状态枚举，等价于 Java 枚举 StatusEnum
 */
export enum StatusEnum {
	ENABLE = 'Y',
	DISABLE = 'N',
}

export enum DefinitionStatusEnum {
	/**
	 * 0-草稿
	 */
	DRAFT = 0,

	/**
	 * 1-发布
	 */
	PUBLISH = 1,

	/**
	 * 2-禁用
	 */
	DISABLED = 2,
}

export const DefinitionStatusEnumLabels: Record<DefinitionStatusEnum, string> = {
	[DefinitionStatusEnum.DRAFT]: '草稿',
	[DefinitionStatusEnum.PUBLISH]: '发布',
	[DefinitionStatusEnum.DISABLED]: '禁用',
}

/**
 * 流程定义状态枚举
 */
export enum SuspensionStateEnum {
	/** 1：激活 */
	ACTIVE = 1,
	/** 2：挂起 */
	SUSPENDED = 2,
}

/**
 * 获取枚举描述
 */
export function getSuspensionStateDescription(state: SuspensionStateEnum): string {
	switch (state) {
		case SuspensionStateEnum.ACTIVE:
			return "激活";
		case SuspensionStateEnum.SUSPENDED:
			return "挂起";
		default:
			return "未知状态";
	}
}


/**
 * 重定向信息(前端使用)
 * TASK_FORM - 任务表单,
 * TASK_LIST - 多任务,
 * NONE - 不跳转
 */
export enum RedirectTypeEnum {
	/**
	 * TASK_FORM - 跳转填写表单
	 */
	TASK_FORM = 'TASK_FORM',

	/**
	 * TASK_LIST - 多任务
	 */
	TASK_LIST = 'TASK_LIST',

	/**
	 * NONE - 不跳转
	 */
	NONE = 'NONE'
}
