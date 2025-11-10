import { reactive } from 'vue'
import type { FormRules } from 'element-plus'

export const accountRules = reactive<FormRules>({
	username: [
		{
			required: true,
			message: '请输入账号',
			trigger: 'blur',
		},
	],
	password: [
		{
			required: true,
			message: '请输入密码',
			trigger: 'blur',
		},
	],
})

export const emailRules = reactive<FormRules>({
	email: [
		{
			required: true,
			message: '请输入电子邮箱',
			trigger: 'blur',
		},
	],
	captcha: [
		{
			required: true,
			message: '请输入验证',
			trigger: 'blur',
		},
	],
})
