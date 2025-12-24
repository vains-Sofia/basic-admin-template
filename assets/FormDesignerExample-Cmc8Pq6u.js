import"./debounce-Bnsqan9y.js";import"./css-Ck0iJ8jv.js";import"./use-aria-CMjMJ4AS.js";import"./_initCloneObject-BsjYyby-.js";import"./css-CTxEvOag.js";import"./_baseClone-B5KGzugA.js";import"./isArrayLikeObject-C0xU5_z6.js";import"./clamp-Bolf2vaL.js";import"./css-1fkavuM7.js";import"./tooltip-9mLRp4o_.js";import"./event-ybyaoC_m.js";import"./scroll-C0Dofiz-.js";import"./css-DENDHyzK.js";import"./use-deprecated-BP8lmVFH.js";import"./aria-CCaT2o1P.js";import"./teleport-DMHkh723.js";import{t as e}from"./css-BxD6NdqY.js";import"./css-DbtyecDw.js";import"./vnode-5olvZtGS.js";import"./css-Vt_9vyhI.js";import"./css-LkOBySAs.js";import{n as t,r as n}from"./FormDesigner-D8oihjSB.js";import"./css-heIaB2f0.js";import"./css-_IYeStbW.js";import"./refs-BjxfU7KM.js";import"./dropdown-BW3LkGFQ.js";import"./dropdown-D3zFqCEz.js";import{Fr as r,_r as i,c as a,dr as o,gr as s,mr as c,qi as l,qr as u,ri as d,ui as f,vr as p,xr as m}from"./index-DkS91mYz.js";import"./Plugins-t28lUS8u.js";import{n as h}from"./CommonDialog-DHvu8fXt.js";/* empty css            *//* empty css            *//* empty css            */import"./Common-D8JbtDdr.js";/* empty css            *//* empty css            */var g={class:`bg-[var(--el-bg-color)] p-8`},_={class:`pl-[125px]`},v=p({__name:`FormDesignerExample`,setup(l){let p=d(),v=()=>{let e=JSON.stringify(p.value?.getData(),null,2);if(!e||e===`{}`){a.info(`无数据`);return}h({title:`查看数据`,content:()=>m(n,{code:e})})};return(n,a)=>{let l=e;return r(),c(`div`,g,[i(f(t),{ref_key:`formViewerRef`,ref:p,"form-json":f(`{
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
}`)},null,8,[`form-json`]),o(`div`,_,[i(l,{plain:``,onClick:a[0]||=()=>p.value?.reset?.()},{default:u(()=>[...a[3]||=[s(` 重置表单 `,-1)]]),_:1}),i(l,{plain:``,onClick:a[1]||=()=>p.value?.validate?.()},{default:u(()=>[...a[4]||=[s(` 验证表单 `,-1)]]),_:1}),i(l,{plain:``,onClick:a[2]||=()=>p.value?.clearAllValidate?.()},{default:u(()=>[...a[5]||=[s(` 清除验证 `,-1)]]),_:1}),i(l,{plain:``,onClick:v},{default:u(()=>[...a[6]||=[s(` 查看数据 `,-1)]]),_:1})])])}}});export{v as default};