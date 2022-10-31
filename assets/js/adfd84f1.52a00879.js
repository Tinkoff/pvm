"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9471],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>m});var a=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function p(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?p(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):p(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},p=Object.keys(e);for(a=0;a<p.length;a++)n=p[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(e);for(a=0;a<p.length;a++)n=p[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=a.createContext({}),o=function(e){var t=a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},s=function(e){var t=o(e.components);return a.createElement(d.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,p=e.originalType,d=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),u=o(n),m=i,f=u["".concat(d,".").concat(m)]||u[m]||c[m]||p;return n?a.createElement(f,r(r({ref:t},s),{},{components:n})):a.createElement(f,r({ref:t},s))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var p=n.length,r=new Array(p);r[0]=u;var l={};for(var d in t)hasOwnProperty.call(t,d)&&(l[d]=t[d]);l.originalType=e,l.mdxType="string"==typeof e?e:i,r[1]=l;for(var o=2;o<p;o++)r[o]=n[o];return a.createElement.apply(null,r)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},3874:(e,t,n)=>{n.r(t),n.d(t,{frontMatter:()=>l,contentTitle:()=>d,metadata:()=>o,toc:()=>s,default:()=>u});var a=n(7462),i=n(3366),p=(n(7294),n(3905)),r=["components"],l={id:"pvm_update.CliUpdateOpts",title:"Interface: CliUpdateOpts",sidebar_label:"CliUpdateOpts",custom_edit_url:null},d=void 0,o={unversionedId:"api/interfaces/pvm_update.CliUpdateOpts",id:"api/interfaces/pvm_update.CliUpdateOpts",isDocsHomePage:!1,title:"Interface: CliUpdateOpts",description:"@pvm/update.CliUpdateOpts",source:"@site/docs/api/interfaces/pvm_update.CliUpdateOpts.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/pvm_update.CliUpdateOpts",permalink:"/pvm/docs/api/interfaces/pvm_update.CliUpdateOpts",editUrl:null,tags:[],version:"current",frontMatter:{id:"pvm_update.CliUpdateOpts",title:"Interface: CliUpdateOpts",sidebar_label:"CliUpdateOpts",custom_edit_url:null}},s=[{value:"Hierarchy",id:"hierarchy",children:[],level:2},{value:"Properties",id:"properties",children:[{value:"cwd",id:"cwd",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3},{value:"dryRun",id:"dryrun",children:[{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"format",id:"format",children:[{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3},{value:"local",id:"local",children:[{value:"Defined in",id:"defined-in-3",children:[],level:4}],level:3},{value:"releaseDataFile",id:"releasedatafile",children:[{value:"Defined in",id:"defined-in-4",children:[],level:4}],level:3},{value:"tagOnly",id:"tagonly",children:[{value:"Defined in",id:"defined-in-5",children:[],level:4}],level:3},{value:"vcsMode",id:"vcsmode",children:[{value:"Defined in",id:"defined-in-6",children:[],level:4}],level:3}],level:2}],c={toc:s};function u(e){var t=e.components,n=(0,i.Z)(e,r);return(0,p.kt)("wrapper",(0,a.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"../modules/pvm_update"},"@pvm/update"),".CliUpdateOpts"),(0,p.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,p.kt)("ul",null,(0,p.kt)("li",{parentName:"ul"},(0,p.kt)("p",{parentName:"li"},(0,p.kt)("strong",{parentName:"p"},(0,p.kt)("inlineCode",{parentName:"strong"},"CliUpdateOpts"))),(0,p.kt)("p",{parentName:"li"},"\u21b3 ",(0,p.kt)("a",{parentName:"p",href:"pvm_update.ReleaseOpts"},(0,p.kt)("inlineCode",{parentName:"a"},"ReleaseOpts"))))),(0,p.kt)("h2",{id:"properties"},"Properties"),(0,p.kt)("h3",{id:"cwd"},"cwd"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,p.kt)("strong",{parentName:"p"},"cwd"),": ",(0,p.kt)("inlineCode",{parentName:"p"},"string")),(0,p.kt)("h4",{id:"defined-in"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/types/cli.ts#L3"},"packages/pvm-update/types/cli.ts:3")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"dryrun"},"dryRun"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,p.kt)("strong",{parentName:"p"},"dryRun"),": ",(0,p.kt)("inlineCode",{parentName:"p"},"boolean")),(0,p.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/types/cli.ts#L2"},"packages/pvm-update/types/cli.ts:2")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"format"},"format"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,p.kt)("strong",{parentName:"p"},"format"),": ",(0,p.kt)("inlineCode",{parentName:"p"},"string")),(0,p.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/types/cli.ts#L8"},"packages/pvm-update/types/cli.ts:8")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"local"},"local"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,p.kt)("strong",{parentName:"p"},"local"),": ",(0,p.kt)("inlineCode",{parentName:"p"},"boolean")),(0,p.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/types/cli.ts#L4"},"packages/pvm-update/types/cli.ts:4")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"releasedatafile"},"releaseDataFile"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,p.kt)("strong",{parentName:"p"},"releaseDataFile"),": ",(0,p.kt)("inlineCode",{parentName:"p"},"string")),(0,p.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/types/cli.ts#L6"},"packages/pvm-update/types/cli.ts:6")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"tagonly"},"tagOnly"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,p.kt)("strong",{parentName:"p"},"tagOnly"),": ",(0,p.kt)("inlineCode",{parentName:"p"},"boolean")),(0,p.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/types/cli.ts#L5"},"packages/pvm-update/types/cli.ts:5")),(0,p.kt)("hr",null),(0,p.kt)("h3",{id:"vcsmode"},"vcsMode"),(0,p.kt)("p",null,"\u2022 ",(0,p.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,p.kt)("strong",{parentName:"p"},"vcsMode"),": ",(0,p.kt)("inlineCode",{parentName:"p"},'"vcs"')," ","|"," ",(0,p.kt)("inlineCode",{parentName:"p"},'"platform"')),(0,p.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,p.kt)("p",null,(0,p.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-update/types/cli.ts#L7"},"packages/pvm-update/types/cli.ts:7")))}u.isMDXComponent=!0}}]);