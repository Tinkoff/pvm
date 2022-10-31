"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[4049],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>u});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function p(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):p(p({},t),e)),n},m=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),d=c(n),u=a,f=d["".concat(l,".").concat(u)]||d[u]||s[u]||i;return n?r.createElement(f,p(p({ref:t},m),{},{components:n})):r.createElement(f,p({ref:t},m))}));function u(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,p=new Array(i);p[0]=d;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o.mdxType="string"==typeof e?e:a,p[1]=o;for(var c=2;c<i;c++)p[c]=n[c];return r.createElement.apply(null,p)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},7131:(e,t,n)=>{n.r(t),n.d(t,{frontMatter:()=>o,contentTitle:()=>l,metadata:()=>c,toc:()=>m,default:()=>d});var r=n(7462),a=n(3366),i=(n(7294),n(3905)),p=["components"],o={id:"pvm_vcs.MetaComment",title:"Interface: MetaComment<Note>",sidebar_label:"MetaComment",custom_edit_url:null},l=void 0,c={unversionedId:"api/interfaces/pvm_vcs.MetaComment",id:"api/interfaces/pvm_vcs.MetaComment",isDocsHomePage:!1,title:"Interface: MetaComment<Note>",description:"@pvm/vcs.MetaComment",source:"@site/docs/api/interfaces/pvm_vcs.MetaComment.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/pvm_vcs.MetaComment",permalink:"/pvm/docs/api/interfaces/pvm_vcs.MetaComment",editUrl:null,tags:[],version:"current",frontMatter:{id:"pvm_vcs.MetaComment",title:"Interface: MetaComment<Note>",sidebar_label:"MetaComment",custom_edit_url:null}},m=[{value:"Type parameters",id:"type-parameters",children:[],level:2},{value:"Properties",id:"properties",children:[{value:"content",id:"content",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3},{value:"metadata",id:"metadata",children:[{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"note",id:"note",children:[{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3}],level:2}],s={toc:m};function d(e){var t=e.components,n=(0,a.Z)(e,p);return(0,i.kt)("wrapper",(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"../modules/pvm_vcs"},"@pvm/vcs"),".MetaComment"),(0,i.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"Note"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"content"},"content"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"content"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-vcs/types/index.ts#L45"},"packages/pvm-vcs/types/index.ts:45")),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"metadata"},"metadata"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"metadata"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Record"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"string"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"any"),">"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-vcs/types/index.ts#L44"},"packages/pvm-vcs/types/index.ts:44")),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"note"},"note"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"note"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Note")),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-vcs/types/index.ts#L46"},"packages/pvm-vcs/types/index.ts:46")))}d.isMDXComponent=!0}}]);