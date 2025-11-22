import"./debounce-Dr6WZ-Ft.js";import"./css-Bk2apCHN.js";import"./use-aria-DX9pH-j_.js";import"./_initCloneObject-B8-XGi_3.js";import"./_baseClone-Bj0dxJjL.js";import"./isPlainObject-CA57XF-Q.js";import{n as e,t}from"./IconSelect-6u937N1a.js";import{t as n}from"./tooltip-DZM7FamG.js";import"./event-CNNKHfKC.js";import"./use-deprecated-DemHDBmm.js";import"./scroll-TL5zfNz5.js";import"./error-BHo25VH8.js";import{t as r}from"./css-CnD8T8A7.js";import"./typescript-CcXtwh7J.js";import"./aria-C1_kUsJD.js";import"./teleport-CbahreEs.js";import"./aria-754WvVeM.js";import{t as i}from"./css-nllxijMv.js";import"./vnode-DHe0NYnF.js";import"./css-BlQ2aCHG.js";import"./dropdown-CjxfwI1b.js";import"./css-eva_xIDK.js";import{t as a}from"./css-HFEm7Dwr.js";import"./defaults-UvedJ0fG.js";import{En as o,Lr as s,Nr as c,Sn as l,Tn as u,Un as d,dr as f,qn as p,tn as m,yn as h,yr as g}from"./index-dNt_JRVh.js";/* empty css            */var _=`
.input-icon-select-suffix {
  padding: 0;
  width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.input-icon-select-suffix:hover {
  color: var(--el-color-primary) !important;
}

.input-icon-select-copy {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--el-text-color-secondary);
}

.input-icon-select-copy:hover {
  color: var(--el-color-primary);
}

.el-input__inner {
  pointer-events: none; /* 禁止手动输入 */
}
`;if(!document.getElementById(`input-icon-select-style`)){let e=document.createElement(`style`);e.id=`input-icon-select-style`,e.innerHTML=_,document.head.appendChild(e)}var v=o({name:`InputIconSelect`,props:{tooltip:{type:Boolean,default:!1},pageSize:{type:Number,default:35},modelValue:{type:String,default:``},inputPlaceholder:{type:String,default:`请选择图标`},iconSelectPlaceholder:{type:String,default:`搜索图标`}},emits:[`update:modelValue`],setup(t,{emit:o}){let s=e=>{if(!t.modelValue){i.info(`无图标`);return}navigator.clipboard.writeText(e).then(()=>{i.success(`已复制: ${e}`)}).catch(()=>{i.error(`复制失败`)})},c=f(t.modelValue),l=e=>{c.value=e,o(`update:modelValue`,e)};return()=>u(r,{modelValue:c.value,placeholder:t.inputPlaceholder,readonly:!0},{suffix:()=>u(`div`,{style:`display: flex; align-items: center;`},[u(a,{placement:`bottom`,width:450,trigger:`click`},{reference:()=>u(`div`,{class:`input-icon-select-suffix`},[t.modelValue?u(m,{icon:t.modelValue,width:20,height:20},null):u(m,{icon:`ri:search-eye-line`,width:20,height:20},null)]),default:()=>u(e,{tooltip:t.tooltip,pageSize:t.pageSize,modelValue:c.value,"onUpdate:modelValue":l,placeholder:t.iconSelectPlaceholder},null)}),u(n,{placement:`top`,content:`点击复制图标`},{default:()=>[u(`div`,{class:`input-icon-select-copy`,onClick:()=>s(t.modelValue)},[u(m,{icon:`ri:file-copy-line`,width:18,height:18},null)])]})])})}}),y={class:`p-5 mb-2`,style:{"background-color":`var(--el-bg-color)`}},b={class:`p-5 mb-2`,style:{"background-color":`var(--el-bg-color)`}},x={class:`p-5 flex`,style:{"background-color":`var(--el-bg-color)`}},S={class:`ml-1`},C=o({__name:`IconSelect1`,setup(e){let n=f(``);return(e,r)=>{let i=p(`Icon`);return d(),l(`div`,null,[h(`div`,y,[u(g(t),{modelValue:n.value,"onUpdate:modelValue":r[0]||=e=>n.value=e,"page-size":200},null,8,[`modelValue`])]),h(`div`,b,[u(g(v),{modelValue:n.value,"onUpdate:modelValue":r[1]||=e=>n.value=e},null,8,[`modelValue`])]),h(`div`,x,[r[2]||=h(`span`,null,`已选图标：`,-1),u(i,{icon:n.value,width:`24`},null,8,[`icon`]),h(`span`,S,c(n.value),1)])])}}});export{C as default};