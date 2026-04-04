import"./debounce-CNEpotRw.js";import"./css-C6Wz_XtM.js";import"./use-aria-CA9__dvH.js";import"./_initCloneObject-BfveUciA.js";import"./css-CQs-7IIu.js";import"./_baseClone-CXVll62g.js";import"./isArrayLikeObject-B_Gw2j3T.js";import"./castArray-B6h_TyM6.js";import"./clamp-BvqW-aqs.js";import"./form-BaNU0otj.js";import"./tooltip-B81jov93.js";import"./event-Dw_J_P2R.js";import"./raf-Cy-hL9W6.js";import"./scroll-BHm4clsn.js";import"./css-niy8oxm6.js";import"./use-form-common-props-C965Vmws.js";import"./aria-BDmYcgRA.js";import"./util-DnJTgqnM.js";import"./scrollbar-DXcRZRnL.js";import"./teleport-Bwkk21CH.js";import{t as e}from"./css-C248cfbK.js";import"./use-deprecated-DOsD6AKH.js";import"./date-Bu7VMrPO.js";import"./vnode-2_qek8T6.js";import"./css-MUu7oYib.js";import"./css-DZqzCXjx.js";import"./css-aTdDRBSX.js";import"./css-BjAkbJId.js";import{n as t,r as n}from"./FormDesigner-Ju_8iIhg.js";import"./repeat-click-BET8DdVa.js";import"./css-lAvbRx6_.js";import"./use-draggable-BZxVRtI_.js";import"./refs-BeLUYFYC.js";import"./css-OrffCOWF.js";import"./dropdown-BP5RTz8M.js";import"./dropdown-m478MYbU.js";import"./css-CPeIqXS4.js";import"./css-CzGZtMZh.js";import"./validator-Bg_RWDQg.js";import"./css-DnVuwEiq.js";import"./message-box-BJ2AK8EV.js";import{Ar as r,Br as i,Fr as a,Ir as o,Lr as s,Nr as c,S as l,Si as u,ei as d,fa as f,fi as p,ki as m}from"./index-CcjE93Br.js";/* empty css            */import"./Plugins-CJZw--c5.js";import{n as h}from"./CommonDialog-D9i0pfdD.js";/* empty css            *//* empty css            *//* empty css            */import"./Common-gqY6s27i.js";/* empty css            *//* empty css            *//* empty css            *//* empty css            */var g={class:`bg-[var(--el-bg-color)] p-8`},_={class:`pl-[125px]`},v=s({__name:`FormDesignerExample`,setup(s){let f=u(),v=()=>{let e=JSON.stringify(f.value?.getData(),null,2);if(!e||e===`{}`){l.info(`无数据`);return}h({title:`查看数据`,content:()=>i(n,{code:e})})};return(n,i)=>{let s=e;return d(),c(`div`,g,[o(m(t),{ref_key:`formViewerRef`,ref:f,"form-json":m(`{
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
}`)},null,8,[`form-json`]),r(`div`,_,[o(s,{plain:``,onClick:i[0]||=()=>f.value?.reset?.()},{default:p(()=>[...i[3]||=[a(` 重置表单 `,-1)]]),_:1}),o(s,{plain:``,onClick:i[1]||=()=>f.value?.validate?.()},{default:p(()=>[...i[4]||=[a(` 验证表单 `,-1)]]),_:1}),o(s,{plain:``,onClick:i[2]||=()=>f.value?.clearAllValidate?.()},{default:p(()=>[...i[5]||=[a(` 清除验证 `,-1)]]),_:1}),o(s,{plain:``,onClick:v},{default:p(()=>[...i[6]||=[a(` 查看数据 `,-1)]]),_:1})])])}}});export{v as default};