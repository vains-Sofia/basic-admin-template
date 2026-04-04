import{n as e}from"./IconSelect-DGXQqSCu.js";import{t}from"./tooltip-B81jov93.js";import{t as n}from"./css-niy8oxm6.js";import{t as r}from"./css-N50XE6H5.js";import{Ir as i,Lr as a,S as o,Si as s,b as c,fa as l,ui as u}from"./index-CcjE93Br.js";var d=`
.icon-select-container .input-icon-select-suffix {
  padding: 0;
  width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-select-container .input-icon-select-suffix:hover {
  color: var(--el-color-primary) !important;
}

.icon-select-container .input-icon-select-copy {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--el-text-color-secondary);
}

.icon-select-container .input-icon-select-copy:hover {
  color: var(--el-color-primary);
}

.icon-select-container .el-input__inner {
  pointer-events: none; /* 禁止手动输入 */
}
`;if(!document.getElementById(`input-icon-select-style`)){let e=document.createElement(`style`);e.id=`input-icon-select-style`,e.innerHTML=d,document.head.appendChild(e)}var f=a({name:`InputIconSelect`,props:{tooltip:{type:Boolean,default:!1},pageSize:{type:Number,default:35},modelValue:{type:String,default:``},inputPlaceholder:{type:String,default:`请选择图标`},iconSelectPlaceholder:{type:String,default:`搜索图标`}},emits:[`update:modelValue`],setup(a,{emit:l}){let d=e=>{if(!a.modelValue){o.info(`无图标`);return}navigator.clipboard.writeText(e).then(()=>{o.success(`已复制: ${e}`)}).catch(()=>{o.error(`复制失败`)})},f=s(a.modelValue),p=e=>{f.value=e,l(`update:modelValue`,e)};return u(()=>a.modelValue,e=>f.value=e),()=>i(n,{class:`icon-select-container`,modelValue:f.value,placeholder:a.inputPlaceholder,readonly:!0},{suffix:()=>i(`div`,{style:`display: flex; align-items: center;`},[i(r,{placement:`bottom`,width:450,trigger:`click`},{reference:()=>i(`div`,{class:`input-icon-select-suffix`},[a.modelValue?i(c,{icon:a.modelValue,width:20,height:20},null):i(c,{icon:`ri:search-eye-line`,width:20,height:20},null)]),default:()=>i(e,{tooltip:a.tooltip,pageSize:a.pageSize,modelValue:f.value,"onUpdate:modelValue":p,placeholder:a.iconSelectPlaceholder},null)}),i(t,{placement:`left`,content:`点击复制图标`},{default:()=>[i(`div`,{class:`input-icon-select-copy`,onClick:()=>d(a.modelValue)},[i(c,{icon:`ri:file-copy-line`,width:18,height:18},null)])]})])})}});export{f as t};