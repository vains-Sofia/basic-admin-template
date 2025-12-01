import"./debounce-XG1GeIpP.js";import"./css-Bw4YEfzz.js";import"./use-aria-Dhn890Yz.js";import"./_initCloneObject-CILmREKg.js";import"./_baseClone-BLhn_WPR.js";import"./isPlainObject-Dt28KLb_.js";import{n as e,t}from"./IconSelect-DVJzYZ7K.js";import{t as n}from"./tooltip-CSiauDMn.js";import"./event-CNNKHfKC.js";import"./scroll-BetDhdl6.js";import{t as r}from"./css-D7NgnUn6.js";import"./use-deprecated-BgSeTQJS.js";import"./aria-B72UaFp8.js";import"./teleport-DZUc3eBs.js";import"./vnode-CmHL8Mkd.js";import"./css-Cxn4uoWC.js";import"./dropdown-T4OiVxmf.js";import"./css-1NgArxnz.js";import{t as i}from"./css-B9-7t8gd.js";import"./defaults-Dy5lkEZb.js";import{Fr as a,Tr as o,cr as s,ei as c,ir as l,kr as u,mi as d,o as f,qr as p,s as m,sr as h,tr as g,vi as _}from"./index-Cl_4-1AA.js";/* empty css            *//* empty css            */var v=`
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
`;if(!document.getElementById(`input-icon-select-style`)){let e=document.createElement(`style`);e.id=`input-icon-select-style`,e.innerHTML=v,document.head.appendChild(e)}var y=s({name:`InputIconSelect`,props:{tooltip:{type:Boolean,default:!1},pageSize:{type:Number,default:35},modelValue:{type:String,default:``},inputPlaceholder:{type:String,default:`请选择图标`},iconSelectPlaceholder:{type:String,default:`搜索图标`}},emits:[`update:modelValue`],setup(t,{emit:o}){let s=e=>{if(!t.modelValue){m.info(`无图标`);return}navigator.clipboard.writeText(e).then(()=>{m.success(`已复制: ${e}`)}).catch(()=>{m.error(`复制失败`)})},c=p(t.modelValue),l=e=>{c.value=e,o(`update:modelValue`,e)};return a(()=>t.modelValue,e=>c.value=e),()=>h(r,{class:`icon-select-container`,modelValue:c.value,placeholder:t.inputPlaceholder,readonly:!0},{suffix:()=>h(`div`,{style:`display: flex; align-items: center;`},[h(i,{placement:`bottom`,width:450,trigger:`click`},{reference:()=>h(`div`,{class:`input-icon-select-suffix`},[t.modelValue?h(f,{icon:t.modelValue,width:20,height:20},null):h(f,{icon:`ri:search-eye-line`,width:20,height:20},null)]),default:()=>h(e,{tooltip:t.tooltip,pageSize:t.pageSize,modelValue:c.value,"onUpdate:modelValue":l,placeholder:t.iconSelectPlaceholder},null)}),h(n,{placement:`left`,content:`点击复制图标`},{default:()=>[h(`div`,{class:`input-icon-select-copy`,onClick:()=>s(t.modelValue)},[h(f,{icon:`ri:file-copy-line`,width:18,height:18},null)])]})])})}}),b={class:`p-5 mb-2`,style:{"background-color":`var(--el-bg-color)`}},x={class:`p-5 mb-2`,style:{"background-color":`var(--el-bg-color)`}},S={class:`p-5 flex`,style:{"background-color":`var(--el-bg-color)`}},C={class:`ml-1`},w=s({__name:`IconSelect1`,setup(e){let n=p(``);return(e,r)=>{let i=u(`Icon`);return o(),l(`div`,null,[g(`div`,b,[h(c(t),{modelValue:n.value,"onUpdate:modelValue":r[0]||=e=>n.value=e,"page-size":200},null,8,[`modelValue`])]),g(`div`,x,[h(c(y),{modelValue:n.value,"onUpdate:modelValue":r[1]||=e=>n.value=e},null,8,[`modelValue`])]),g(`div`,S,[r[2]||=g(`span`,null,`已选图标：`,-1),h(i,{icon:n.value,width:`24`},null,8,[`icon`]),g(`span`,C,d(n.value),1)])])}}});export{w as default};