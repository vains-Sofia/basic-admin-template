import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
	typeCode: [{ required: true, message: "字典类型必选", trigger: "blur" }],
	itemCode: [{ required: true, message: "字典编码不能为空", trigger: "blur" }],
	itemName: [{ required: true, message: "字典名称不能为空", trigger: "blur" }]
});
