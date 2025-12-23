export const formSchema = `{
  "formId": "field_1766477264807_py5o8oq",
  "formName": "请假表单",
  "formConfig": {
    "labelWidth": 120,
    "labelPosition": "right",
    "size": "default",
    "fieldPadding": 5
  },
  "fields": [
    {
      "fieldId": "field_1766477266925_nlysa41",
      "type": "input",
      "label": "请假人",
      "labelCn": "输入框",
      "icon": "ep:edit",
      "category": "basic",
      "fieldName": "username",
      "valueType": "string",
      "validationRules": [
        {
          "validatorKey": "required",
          "required": true,
          "trigger": "blur",
          "message": "请假人不能为空"
        }
      ],
      "componentProps": {
        "type": "text",
        "clearable": true,
        "placeholder": "请假人"
      }
    },
    {
      "fieldId": "field_1766477268089_pz3z0az",
      "type": "textarea",
      "label": "请假原因",
      "labelCn": "文本域",
      "icon": "ep:document",
      "category": "basic",
      "fieldName": "cause",
      "validationRules": [],
      "valueType": "string",
      "componentProps": {
        "rows": 4,
        "maxlength": 500,
        "showWordLimit": true,
        "placeholder": "请假原因"
      }
    },
    {
      "fieldId": "field_1766477269615_tjg6muo",
      "type": "datePicker",
      "label": "开始日期",
      "labelCn": "日期",
      "icon": "ep:calendar",
      "category": "datetime",
      "fieldName": "start",
      "validationRules": [
        {
          "validatorKey": "required",
          "required": true,
          "trigger": "blur",
          "message": "开始日期不能为空"
        }
      ],
      "valueType": "date",
      "componentProps": {
        "type": "date",
        "format": "YYYY-MM-DD",
        "valueFormat": "YYYY-MM-DD",
        "placeholder": "请假开始日期"
      }
    },
    {
      "fieldId": "field_1766477270452_h2edwfn",
      "type": "datePicker",
      "label": "结束日期",
      "labelCn": "日期",
      "icon": "ep:calendar",
      "category": "datetime",
      "fieldName": "end",
      "validationRules": [
        {
          "validatorKey": "required",
          "required": true,
          "trigger": "blur",
          "message": "结束日期不能为空"
        }
      ],
      "valueType": "date",
      "componentProps": {
        "type": "date",
        "format": "YYYY-MM-DD",
        "valueFormat": "YYYY-MM-DD",
        "placeholder": "请假结束日期"
      }
    },
    {
      "fieldId": "field_1766477288557_j3k8rnv",
      "type": "input",
      "label": "请假天数",
      "labelCn": "输入框",
      "icon": "ep:edit",
      "category": "basic",
      "fieldName": "days",
      "valueType": "string",
      "validationRules": [
        {
          "validatorKey": "pattern",
          "required": false,
          "trigger": "blur",
          "validatorPattern": "^(?:0*\\\\.[0-9]*[1-9][0-9]*|[1-9][0-9]*(?:\\\\.[0-9]+)?)$",
          "message": "请假天数必须大于0"
        }
      ],
      "componentProps": {
        "type": "text",
        "clearable": true,
        "readonly": true,
        "placeholder": "自动计算"
      },
      "compute": {
        "dependsOn": [
          "end",
          "start"
        ],
        "expression": "end - start",
        "unit": "day"
      }
    }
  ]
}`
