"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[2161],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>c});var a=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function p(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?p(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):p(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function r(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},p=Object.keys(e);for(a=0;a<p.length;a++)n=p[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(e);for(a=0;a<p.length;a++)n=p[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=a.createContext({}),u=function(e){var t=a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=u(e.components);return a.createElement(d.Provider,{value:t},e.children)},o={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,p=e.originalType,d=e.parentName,s=r(e,["components","mdxType","originalType","parentName"]),m=u(n),c=i,k=m["".concat(d,".").concat(c)]||m[c]||o[c]||p;return n?a.createElement(k,l(l({ref:t},s),{},{components:n})):a.createElement(k,l({ref:t},s))}));function c(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var p=n.length,l=new Array(p);l[0]=m;var r={};for(var d in t)hasOwnProperty.call(t,d)&&(r[d]=t[d]);r.originalType=e,r.mdxType="string"==typeof e?e:i,l[1]=r;for(var u=2;u<p;u++)l[u]=n[u];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},4991:(e,t,n)=>{n.r(t),n.d(t,{frontMatter:()=>r,contentTitle:()=>d,metadata:()=>u,toc:()=>s,default:()=>m});var a=n(7462),i=n(3366),p=(n(7294),n(3905)),l=["components"],r={id:"pvm_update.UpdateReasonType",title:"Enumeration: UpdateReasonType",sidebar_label:"UpdateReasonType",custom_edit_url:null},d=void 0,u={unversionedId:"api/enums/pvm_update.UpdateReasonType",id:"api/enums/pvm_update.UpdateReasonType",isDocsHomePage:!1,title:"Enumeration: UpdateReasonType",description:"@pvm/update.UpdateReasonType",source:"@site/docs/api/enums/pvm_update.UpdateReasonType.md",sourceDirName:"api/enums",slug:"/api/enums/pvm_update.UpdateReasonType",permalink:"/pvm/docs/api/enums/pvm_update.UpdateReasonType",editUrl:null,tags:[],version:"current",frontMatter:{id:"pvm_update.UpdateReasonType",title:"Enumeration: UpdateReasonType",sidebar_label:"UpdateReasonType",custom_edit_url:null}},s=[{value:"Enumeration members",id:"enumeration-members",children:[{value:"always_changed",id:"always_changed",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3},{value:"by_commits",id:"by_commits",children:[{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"by_plugin",id:"by_plugin",children:[{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3},{value:"changed",id:"changed",children:[{value:"Defined in",id:"defined-in-3",children:[],level:4}],level:3},{value:"dependant",id:"dependant",children:[{value:"Defined in",id:"defined-in-4",children:[],level:4}],level:3},{value:"hints",id:"hints",children:[{value:"Defined in",id:"defined-in-5",children:[],level:4}],level:3},{value:"manually_set",id:"manually_set",children:[{value:"Defined in",id:"defined-in-6",children:[],level:4}],level:3},{value:"new",id:"new",children:[{value:"Defined in",id:"defined-in-7",children:[],level:4}],level:3},{value:"release_type_overrides",id:"release_type_overrides",children:[{value:"Defined in",id:"defined-in-8",children:[],level:4}],level:3},{value:"unified",id:"unified",children:[{value:"Defined in",id:"defined-in-9",children:[],level:4}],level:3},{value:"unknown",id:"unknown",children:[{value:"Defined in",id:"defined-in-10",children:[],level:4}],level:3},{value:"workspace_file",id:"workspace_file",children:[{value:"Defined in",id:"defined-in-11",children:[],level:4}],level:3}],level:2}],o={toc:s};function m(e){var t=e.components,n=(0,i.Z)(e,l);return(0,p.kt)("wrapper",(0,a.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"../modules/pvm_update"},"@pvm/update"),".UpdateReasonType"),(0,p.kt)("h2",{id:"enumeration-members"},"Enumeration members"),(0,p.kt)("h3",{id:"always_changed"},"always","_","changed"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("strong",{parentName:"p"},"always","_","changed")," = ",(0,p.kt)("inlineCode",{parentName:"p"},'"always_changed"')),(0,p.kt)("h4",{id:"defined-in"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/lib/update-state.ts#L68"},"packages/pvm-update/lib/update-state.ts:68")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"by_commits"},"by","_","commits"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("strong",{parentName:"p"},"by","_","commits")," = ",(0,p.kt)("inlineCode",{parentName:"p"},'"by_commits"')),(0,p.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/lib/update-state.ts#L65"},"packages/pvm-update/lib/update-state.ts:65")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"by_plugin"},"by","_","plugin"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("strong",{parentName:"p"},"by","_","plugin")," = ",(0,p.kt)("inlineCode",{parentName:"p"},'"by_plugin"')),(0,p.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/lib/update-state.ts#L62"},"packages/pvm-update/lib/update-state.ts:62")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"changed"},"changed"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("strong",{parentName:"p"},"changed")," = ",(0,p.kt)("inlineCode",{parentName:"p"},'"changed"')),(0,p.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/lib/update-state.ts#L67"},"packages/pvm-update/lib/update-state.ts:67")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"dependant"},"dependant"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("strong",{parentName:"p"},"dependant")," = ",(0,p.kt)("inlineCode",{parentName:"p"},'"dependant"')),(0,p.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/lib/update-state.ts#L58"},"packages/pvm-update/lib/update-state.ts:58")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"hints"},"hints"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("strong",{parentName:"p"},"hints")," = ",(0,p.kt)("inlineCode",{parentName:"p"},'"hints"')),(0,p.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/lib/update-state.ts#L63"},"packages/pvm-update/lib/update-state.ts:63")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"manually_set"},"manually","_","set"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("strong",{parentName:"p"},"manually","_","set")," = ",(0,p.kt)("inlineCode",{parentName:"p"},'"manually_set"')),(0,p.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/lib/update-state.ts#L60"},"packages/pvm-update/lib/update-state.ts:60")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"new"},"new"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("strong",{parentName:"p"},"new")," = ",(0,p.kt)("inlineCode",{parentName:"p"},'"new"')),(0,p.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/lib/update-state.ts#L59"},"packages/pvm-update/lib/update-state.ts:59")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"release_type_overrides"},"release","_","type","_","overrides"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("strong",{parentName:"p"},"release","_","type","_","overrides")," = ",(0,p.kt)("inlineCode",{parentName:"p"},'"release_type_overrides"')),(0,p.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/lib/update-state.ts#L64"},"packages/pvm-update/lib/update-state.ts:64")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"unified"},"unified"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("strong",{parentName:"p"},"unified")," = ",(0,p.kt)("inlineCode",{parentName:"p"},'"unified"')),(0,p.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/lib/update-state.ts#L66"},"packages/pvm-update/lib/update-state.ts:66")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"unknown"},"unknown"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("strong",{parentName:"p"},"unknown")," = ",(0,p.kt)("inlineCode",{parentName:"p"},'"unknown"')),(0,p.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/lib/update-state.ts#L57"},"packages/pvm-update/lib/update-state.ts:57")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"workspace_file"},"workspace","_","file"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("strong",{parentName:"p"},"workspace","_","file")," = ",(0,p.kt)("inlineCode",{parentName:"p"},'"workspace_file"')),(0,p.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/lib/update-state.ts#L61"},"packages/pvm-update/lib/update-state.ts:61")))}m.isMDXComponent=!0}}]);