import"./debounce-C4C-SJls.js";import"./css-D5DkdgOW.js";import"./use-aria-J_Ne2tnR.js";import"./_initCloneObject-wOjwEq-f.js";import"./css-DNWxUiRB.js";import"./_baseClone-uNnMXV0_.js";import"./isArrayLikeObject-vOz68ZFj.js";import"./castArray-B4VbZJyS.js";import"./clamp-CJrL-ox8.js";import"./form-2E1thE10.js";import"./tooltip-DQDC3g-i.js";import"./event-Dw_J_P2R.js";import"./raf-DO8npoJN.js";import"./scroll-Cmw3krC1.js";import"./css-0dTukD5x.js";import"./use-form-common-props-BGl1K_Ld.js";import"./aria-BDmYcgRA.js";import"./util-DnJTgqnM.js";import"./scrollbar-CaMql7zg.js";import"./teleport-CjsKHhNc.js";import{t as e}from"./css-Z0jwqyJh.js";import"./use-deprecated-BxoQWS81.js";import"./date-Bu7VMrPO.js";import"./vnode-Bm8v1xkw.js";import"./css-iCJNY6gI.js";import"./css-BTQba2-h.js";import"./css-Cznd7bNF.js";import"./css-DwdEe764.js";import{n as t,r as n}from"./FormDesigner-BsjYT2tC.js";import"./repeat-click-DwKdgA2p.js";import"./css-DOcKn9z2.js";import"./use-draggable-AwY-ZYW1.js";import"./refs-laguH9v8.js";import"./css-Cgf85azw.js";import"./dropdown-DLLH3FIl.js";import"./dropdown-CV6zM_vV.js";import"./css-D_PAOizB.js";import"./css-BorybD4p.js";import"./validator-Dhl1W2ee.js";import"./css-uiu3OVBM.js";import"./message-box-CKZ2rpym.js";import{$r as r,Fr as i,Ir as a,Mr as o,Oi as s,Pr as c,da as l,di as u,kr as d,x as f,xi as p,zr as m}from"./index-oo9OB-cG.js";/* empty css            */import"./Plugins-Cubxwalb.js";import{n as h}from"./CommonDialog-CEcRnpSK.js";/* empty css            *//* empty css            *//* empty css            */import"./Common-yIVD6n24.js";/* empty css            *//* empty css            *//* empty css            *//* empty css            */var g={class:`bg-[var(--el-bg-color)] p-8`},_={class:`pl-[125px]`},v=a({__name:`FormDesignerExample`,setup(a){let l=p(),v=()=>{let e=JSON.stringify(l.value?.getData(),null,2);if(!e||e===`{}`){f.info(`无数据`);return}h({title:`查看数据`,content:()=>m(n,{code:e})})};return(n,a)=>{let f=e;return r(),o(`div`,g,[i(s(t),{ref_key:`formViewerRef`,ref:l,"form-json":s(`{
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
}`)},null,8,[`form-json`]),d(`div`,_,[i(f,{plain:``,onClick:a[0]||=()=>l.value?.reset?.()},{default:u(()=>[...a[3]||=[c(` 重置表单 `,-1)]]),_:1}),i(f,{plain:``,onClick:a[1]||=()=>l.value?.validate?.()},{default:u(()=>[...a[4]||=[c(` 验证表单 `,-1)]]),_:1}),i(f,{plain:``,onClick:a[2]||=()=>l.value?.clearAllValidate?.()},{default:u(()=>[...a[5]||=[c(` 清除验证 `,-1)]]),_:1}),i(f,{plain:``,onClick:v},{default:u(()=>[...a[6]||=[c(` 查看数据 `,-1)]]),_:1})])])}}});export{v as default};