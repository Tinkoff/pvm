"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[421],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>u});var r=n(7294);function p(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){p(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,p=function(e,t){if(null==e)return{};var n,r,p={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(p[n]=e[n]);return p}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(p[n]=e[n])}return p}var s=r.createContext({}),o=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},d=function(e){var t=o(e.components);return r.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,p=e.mdxType,a=e.originalType,s=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),m=o(n),u=p,f=m["".concat(s,".").concat(u)]||m[u]||c[u]||a;return n?r.createElement(f,i(i({ref:t},d),{},{components:n})):r.createElement(f,i({ref:t},d))}));function u(e,t){var n=arguments,p=t&&t.mdxType;if("string"==typeof e||p){var a=n.length,i=new Array(a);i[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:p,i[1]=l;for(var o=2;o<a;o++)i[o]=n[o];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},5200:(e,t,n)=>{n.r(t),n.d(t,{frontMatter:()=>l,contentTitle:()=>s,metadata:()=>o,toc:()=>d,default:()=>m});var r=n(7462),p=n(3366),a=(n(7294),n(3905)),i=["components"],l={id:"pvm_types.UpdateHints",title:"Interface: UpdateHints",sidebar_label:"UpdateHints",custom_edit_url:null},s=void 0,o={unversionedId:"api/interfaces/pvm_types.UpdateHints",id:"api/interfaces/pvm_types.UpdateHints",isDocsHomePage:!1,title:"Interface: UpdateHints",description:"@pvm/types.UpdateHints",source:"@site/docs/api/interfaces/pvm_types.UpdateHints.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/pvm_types.UpdateHints",permalink:"/pvm/docs/api/interfaces/pvm_types.UpdateHints",editUrl:null,tags:[],version:"current",frontMatter:{id:"pvm_types.UpdateHints",title:"Interface: UpdateHints",sidebar_label:"UpdateHints",custom_edit_url:null}},d=[{value:"Properties",id:"properties",children:[{value:"release-type",id:"release-type",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3},{value:"release-types",id:"release-types",children:[{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"update-dependants-for",id:"update-dependants-for",children:[{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3}],level:2}],c={toc:d};function m(e){var t=e.components,n=(0,p.Z)(e,i);return(0,a.kt)("wrapper",(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"../modules/pvm_types"},"@pvm/types"),".UpdateHints"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"release-type"},"release-type"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"release-type"),": ",(0,a.kt)("a",{parentName:"p",href:"../modules/pvm_types#pvmreleasetype"},(0,a.kt)("inlineCode",{parentName:"a"},"PvmReleaseType"))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-types/lib/publish.ts#L44"},"packages/pvm-types/lib/publish.ts:44")),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"release-types"},"release-types"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"release-types"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Partial"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Record"),"<",(0,a.kt)("a",{parentName:"p",href:"../modules/pvm_types#pvmreleasetype"},(0,a.kt)("inlineCode",{parentName:"a"},"PvmReleaseType")),", ",(0,a.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"string"),"[]",">",">"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-types/lib/publish.ts#L45"},"packages/pvm-types/lib/publish.ts:45")),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"update-dependants-for"},"update-dependants-for"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"update-dependants-for"),": { ",(0,a.kt)("inlineCode",{parentName:"p"},"match"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")," ; ",(0,a.kt)("inlineCode",{parentName:"p"},"release-type"),": ",(0,a.kt)("a",{parentName:"p",href:"../modules/pvm_types#pvmreleasetype"},(0,a.kt)("inlineCode",{parentName:"a"},"PvmReleaseType"))," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},'"as-dep"'),"  }[]"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-types/lib/publish.ts#L46"},"packages/pvm-types/lib/publish.ts:46")))}m.isMDXComponent=!0}}]);