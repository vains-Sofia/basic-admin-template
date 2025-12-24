import"./debounce-Bnsqan9y.js";import"./css-Ck0iJ8jv.js";import"./use-aria-CMjMJ4AS.js";import"./_initCloneObject-BsjYyby-.js";import"./_baseClone-B5KGzugA.js";import"./isPlainObject-DyxlF7c1.js";import{n as e,t}from"./IconSelect-DGqUgvGo.js";import"./clamp-Bolf2vaL.js";import{t as n}from"./tooltip-9mLRp4o_.js";import"./event-ybyaoC_m.js";import"./scroll-C0Dofiz-.js";import{t as r}from"./css-DENDHyzK.js";import"./use-deprecated-BP8lmVFH.js";import"./aria-CCaT2o1P.js";import"./teleport-DMHkh723.js";import"./vnode-5olvZtGS.js";import"./css-LkOBySAs.js";import"./dropdown-BW3LkGFQ.js";import"./css-0gi3Cdff.js";import{t as i}from"./css-DUS9RPa_.js";import"./defaults-CFOAVHEa.js";import{Fr as a,Gr as o,Vi as s,_r as c,c as l,dr as u,mr as d,o as f,qi as p,ri as m,ui as h,vr as g,zr as _}from"./index-DkS91mYz.js";/* empty css            *//* empty css            */var v=`
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
`;if(!document.getElementById(`input-icon-select-style`)){let e=document.createElement(`style`);e.id=`input-icon-select-style`,e.innerHTML=v,document.head.appendChild(e)}var y=g({name:`InputIconSelect`,props:{tooltip:{type:Boolean,default:!1},pageSize:{type:Number,default:35},modelValue:{type:String,default:``},inputPlaceholder:{type:String,default:`请选择图标`},iconSelectPlaceholder:{type:String,default:`搜索图标`}},emits:[`update:modelValue`],setup(t,{emit:a}){let s=e=>{if(!t.modelValue){l.info(`无图标`);return}navigator.clipboard.writeText(e).then(()=>{l.success(`已复制: ${e}`)}).catch(()=>{l.error(`复制失败`)})},u=m(t.modelValue),d=e=>{u.value=e,a(`update:modelValue`,e)};return o(()=>t.modelValue,e=>u.value=e),()=>c(r,{class:`icon-select-container`,modelValue:u.value,placeholder:t.inputPlaceholder,readonly:!0},{suffix:()=>c(`div`,{style:`display: flex; align-items: center;`},[c(i,{placement:`bottom`,width:450,trigger:`click`},{reference:()=>c(`div`,{class:`input-icon-select-suffix`},[t.modelValue?c(f,{icon:t.modelValue,width:20,height:20},null):c(f,{icon:`ri:search-eye-line`,width:20,height:20},null)]),default:()=>c(e,{tooltip:t.tooltip,pageSize:t.pageSize,modelValue:u.value,"onUpdate:modelValue":d,placeholder:t.iconSelectPlaceholder},null)}),c(n,{placement:`left`,content:`点击复制图标`},{default:()=>[c(`div`,{class:`input-icon-select-copy`,onClick:()=>s(t.modelValue)},[c(f,{icon:`ri:file-copy-line`,width:18,height:18},null)])]})])})}}),b={class:`p-5 mb-2`,style:{"background-color":`var(--el-bg-color)`}},x={class:`p-5 mb-2`,style:{"background-color":`var(--el-bg-color)`}},S={class:`p-5 flex`,style:{"background-color":`var(--el-bg-color)`}},C={class:`ml-1`},w=g({__name:`IconSelect1`,setup(e){let n=m(``);return(e,r)=>{let i=_(`Icon`);return a(),d(`div`,null,[u(`div`,b,[c(h(t),{modelValue:n.value,"onUpdate:modelValue":r[0]||=e=>n.value=e,"page-size":200},null,8,[`modelValue`])]),u(`div`,x,[c(h(y),{modelValue:n.value,"onUpdate:modelValue":r[1]||=e=>n.value=e},null,8,[`modelValue`])]),u(`div`,S,[r[2]||=u(`span`,null,`已选图标：`,-1),c(i,{icon:n.value,width:`24`},null,8,[`icon`]),u(`span`,C,s(n.value),1)])])}}});export{w as default};