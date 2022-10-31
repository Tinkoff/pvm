"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[1408],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>f});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=r.createContext({}),s=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},c=function(e){var t=s(e.components);return r.createElement(p.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,p=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),m=s(n),f=i,u=m["".concat(p,".").concat(f)]||m[f]||d[f]||a;return n?r.createElement(u,l(l({ref:t},c),{},{components:n})):r.createElement(u,l({ref:t},c))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,l=new Array(a);l[0]=m;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o.mdxType="string"==typeof e?e:i,l[1]=o;for(var s=2;s<a;s++)l[s]=n[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},6661:(e,t,n)=>{n.r(t),n.d(t,{frontMatter:()=>o,contentTitle:()=>p,metadata:()=>s,toc:()=>c,default:()=>m});var r=n(7462),i=n(3366),a=(n(7294),n(3905)),l=["components"],o={id:"pvm_changelog.ListOptions",title:"Interface: ListOptions",sidebar_label:"ListOptions",custom_edit_url:null},p=void 0,s={unversionedId:"api/interfaces/pvm_changelog.ListOptions",id:"api/interfaces/pvm_changelog.ListOptions",isDocsHomePage:!1,title:"Interface: ListOptions",description:"@pvm/changelog.ListOptions",source:"@site/docs/api/interfaces/pvm_changelog.ListOptions.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/pvm_changelog.ListOptions",permalink:"/pvm/docs/api/interfaces/pvm_changelog.ListOptions",editUrl:null,tags:[],version:"current",frontMatter:{id:"pvm_changelog.ListOptions",title:"Interface: ListOptions",sidebar_label:"ListOptions",custom_edit_url:null}},c=[{value:"Properties",id:"properties",children:[{value:"date_format",id:"date_format",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3},{value:"show_date",id:"show_date",children:[{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"tag_head_level",id:"tag_head_level",children:[{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3}],level:2}],d={toc:c};function m(e){var t=e.components,n=(0,i.Z)(e,l);return(0,a.kt)("wrapper",(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"../modules/pvm_changelog"},"@pvm/changelog"),".ListOptions"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"date_format"},"date","_","format"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"date","_","format"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-changelog/lib/md/list.ts#L7"},"packages/pvm-changelog/lib/md/list.ts:7")),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"show_date"},"show","_","date"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"show","_","date"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-changelog/lib/md/list.ts#L9"},"packages/pvm-changelog/lib/md/list.ts:9")),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"tag_head_level"},"tag","_","head","_","level"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"tag","_","head","_","level"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-changelog/lib/md/list.ts#L8"},"packages/pvm-changelog/lib/md/list.ts:8")))}m.isMDXComponent=!0}}]);