"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9995],{3905:(e,r,t)=>{t.d(r,{Zo:()=>c,kt:()=>f});var n=t(7294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function s(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function l(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?s(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):s(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function o(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},s=Object.keys(e);for(n=0;n<s.length;n++)t=s[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(n=0;n<s.length;n++)t=s[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var i=n.createContext({}),p=function(e){var r=n.useContext(i),t=r;return e&&(t="function"==typeof e?e(r):l(l({},r),e)),t},c=function(e){var r=p(e.components);return n.createElement(i.Provider,{value:r},e.children)},m={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},u=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,s=e.originalType,i=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),u=p(t),f=a,d=u["".concat(i,".").concat(f)]||u[f]||m[f]||s;return t?n.createElement(d,l(l({ref:r},c),{},{components:t})):n.createElement(d,l({ref:r},c))}));function f(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var s=t.length,l=new Array(s);l[0]=u;var o={};for(var i in r)hasOwnProperty.call(r,i)&&(o[i]=r[i]);o.originalType=e,o.mdxType="string"==typeof e?e:a,l[1]=o;for(var p=2;p<s;p++)l[p]=t[p];return n.createElement.apply(null,l)}return n.createElement.apply(null,t)}u.displayName="MDXCreateElement"},135:(e,r,t)=>{t.r(r),t.d(r,{frontMatter:()=>o,contentTitle:()=>i,metadata:()=>p,toc:()=>c,default:()=>u});var n=t(7462),a=t(3366),s=(t(7294),t(3905)),l=["components"],o={id:"pvm_releases.MakeReleasesFromWTOpts",title:"Interface: MakeReleasesFromWTOpts",sidebar_label:"MakeReleasesFromWTOpts",custom_edit_url:null},i=void 0,p={unversionedId:"api/interfaces/pvm_releases.MakeReleasesFromWTOpts",id:"api/interfaces/pvm_releases.MakeReleasesFromWTOpts",isDocsHomePage:!1,title:"Interface: MakeReleasesFromWTOpts",description:"@pvm/releases.MakeReleasesFromWTOpts",source:"@site/docs/api/interfaces/pvm_releases.MakeReleasesFromWTOpts.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/pvm_releases.MakeReleasesFromWTOpts",permalink:"/pvm/docs/api/interfaces/pvm_releases.MakeReleasesFromWTOpts",editUrl:null,tags:[],version:"current",frontMatter:{id:"pvm_releases.MakeReleasesFromWTOpts",title:"Interface: MakeReleasesFromWTOpts",sidebar_label:"MakeReleasesFromWTOpts",custom_edit_url:null}},c=[{value:"Properties",id:"properties",children:[{value:"startFrom",id:"startfrom",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3},{value:"stopAtRef",id:"stopatref",children:[{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3}],level:2}],m={toc:c};function u(e){var r=e.components,t=(0,a.Z)(e,l);return(0,s.kt)("wrapper",(0,n.Z)({},m,t,{components:r,mdxType:"MDXLayout"}),(0,s.kt)("p",null,(0,s.kt)("a",{parentName:"p",href:"../modules/pvm_releases"},"@pvm/releases"),".MakeReleasesFromWTOpts"),(0,s.kt)("h2",{id:"properties"},"Properties"),(0,s.kt)("h3",{id:"startfrom"},"startFrom"),(0,s.kt)("p",null,"\u2022 ",(0,s.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,s.kt)("strong",{parentName:"p"},"startFrom"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"string")),(0,s.kt)("h4",{id:"defined-in"},"Defined in"),(0,s.kt)("p",null,(0,s.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-releases/lib/producers/releases-by-working-tree.ts#L22"},"packages/pvm-releases/lib/producers/releases-by-working-tree.ts:22")),(0,s.kt)("hr",null),(0,s.kt)("h3",{id:"stopatref"},"stopAtRef"),(0,s.kt)("p",null,"\u2022 ",(0,s.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,s.kt)("strong",{parentName:"p"},"stopAtRef"),": ",(0,s.kt)("inlineCode",{parentName:"p"},"string")),(0,s.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,s.kt)("p",null,(0,s.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-releases/lib/producers/releases-by-working-tree.ts#L21"},"packages/pvm-releases/lib/producers/releases-by-working-tree.ts:21")))}u.isMDXComponent=!0}}]);