"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[1140],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>u});var a=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=a.createContext({}),o=function(e){var t=a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},m=function(e){var t=o(e.components);return a.createElement(d.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},k=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,d=e.parentName,m=p(e,["components","mdxType","originalType","parentName"]),k=o(n),u=i,f=k["".concat(d,".").concat(u)]||k[u]||s[u]||r;return n?a.createElement(f,l(l({ref:t},m),{},{components:n})):a.createElement(f,l({ref:t},m))}));function u(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,l=new Array(r);l[0]=k;var p={};for(var d in t)hasOwnProperty.call(t,d)&&(p[d]=t[d]);p.originalType=e,p.mdxType="string"==typeof e?e:i,l[1]=p;for(var o=2;o<r;o++)l[o]=n[o];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}k.displayName="MDXCreateElement"},7671:(e,t,n)=>{n.r(t),n.d(t,{frontMatter:()=>p,contentTitle:()=>d,metadata:()=>o,toc:()=>m,default:()=>k});var a=n(7462),i=n(3366),r=(n(7294),n(3905)),l=["components"],p={id:"pvm_files",title:"Module: @pvm/files",sidebar_label:"@pvm/files",sidebar_position:0,custom_edit_url:null},d="@pvm/files",o={unversionedId:"api/modules/pvm_files",id:"api/modules/pvm_files",isDocsHomePage:!1,title:"Module: @pvm/files",description:"Variables",source:"@site/docs/api/modules/pvm_files.md",sourceDirName:"api/modules",slug:"/api/modules/pvm_files",permalink:"/pvm/docs/api/modules/pvm_files",editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"pvm_files",title:"Module: @pvm/files",sidebar_label:"@pvm/files",sidebar_position:0,custom_edit_url:null},sidebar:"API",previous:{title:"@pvm/di",permalink:"/pvm/docs/api/modules/pvm_di"},next:{title:"@pvm/gitlab",permalink:"/pvm/docs/api/modules/pvm_gitlab"}},m=[{value:"Variables",id:"variables",children:[{value:"command",id:"command",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3},{value:"description",id:"description",children:[{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3}],level:2},{value:"Functions",id:"functions",children:[{value:"builder",id:"builder",children:[{value:"Parameters",id:"parameters",children:[],level:4},{value:"Returns",id:"returns",children:[],level:4},{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3},{value:"default",id:"default",children:[{value:"Parameters",id:"parameters-1",children:[],level:4},{value:"Returns",id:"returns-1",children:[],level:4},{value:"Defined in",id:"defined-in-3",children:[],level:4}],level:3},{value:"handler",id:"handler",children:[{value:"Parameters",id:"parameters-2",children:[],level:4},{value:"Returns",id:"returns-2",children:[],level:4},{value:"Defined in",id:"defined-in-4",children:[],level:4}],level:3}],level:2}],s={toc:m};function k(e){var t=e.components,n=(0,i.Z)(e,l);return(0,r.kt)("wrapper",(0,a.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"pvmfiles"},"@pvm/files"),(0,r.kt)("h2",{id:"variables"},"Variables"),(0,r.kt)("h3",{id:"command"},"command"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"command"),": ",(0,r.kt)("inlineCode",{parentName:"p"},'"files"')),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-files/cli/pvm-files.ts#L10"},"packages/pvm-files/cli/pvm-files.ts:10")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"description"},"description"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"description"),": ",(0,r.kt)("inlineCode",{parentName:"p"},'"Output files by glob in the list of packages (packages are choosing by pkgset strategies logic)"')),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-files/cli/pvm-files.ts#L11"},"packages/pvm-files/cli/pvm-files.ts:11")),(0,r.kt)("h2",{id:"functions"},"Functions"),(0,r.kt)("h3",{id:"builder"},"builder"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Const")," ",(0,r.kt)("strong",{parentName:"p"},"builder"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"yargs"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"Argv"),"<{ ",(0,r.kt)("inlineCode",{parentName:"p"},"files"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"unknown"),"  } & { ",(0,r.kt)("inlineCode",{parentName:"p"},"strategy"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string"),"  } & { ",(0,r.kt)("inlineCode",{parentName:"p"},"absolute"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),"  } & { ",(0,r.kt)("inlineCode",{parentName:"p"},"S"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Argv"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Default"),">","  }",">"),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"yargs")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Argv"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Object"),">")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Argv"),"<{ ",(0,r.kt)("inlineCode",{parentName:"p"},"files"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"unknown"),"  } & { ",(0,r.kt)("inlineCode",{parentName:"p"},"strategy"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string"),"  } & { ",(0,r.kt)("inlineCode",{parentName:"p"},"absolute"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),"  } & { ",(0,r.kt)("inlineCode",{parentName:"p"},"S"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Argv"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Default"),">","  }",">"),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-files/cli/pvm-files.ts#L12"},"packages/pvm-files/cli/pvm-files.ts:12")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"default"},"default"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"default"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"filesGlob"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"opts"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"string"),"[]",">"),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"filesGlob")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"string"),"[]")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"opts")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Record"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"string"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"any"),">")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"string"),"[]",">"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-files/lib/files.ts#L13"},"packages/pvm-files/lib/files.ts:13")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"handler"},"handler"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Const")," ",(0,r.kt)("strong",{parentName:"p"},"handler"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"argv"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"argv")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"any"))))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-files/cli/pvm-files.ts#L40"},"packages/pvm-files/cli/pvm-files.ts:40")))}k.isMDXComponent=!0}}]);