"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[7953],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>m});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var o=r.createContext({}),s=function(e){var t=r.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},c=function(e){var t=s(e.components);return r.createElement(o.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,o=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),d=s(n),m=i,f=d["".concat(o,".").concat(m)]||d[m]||u[m]||a;return n?r.createElement(f,l(l({ref:t},c),{},{components:n})):r.createElement(f,l({ref:t},c))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,l=new Array(a);l[0]=d;var p={};for(var o in t)hasOwnProperty.call(t,o)&&(p[o]=t[o]);p.originalType=e,p.mdxType="string"==typeof e?e:i,l[1]=p;for(var s=2;s<a;s++)l[s]=n[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},6085:(e,t,n)=>{n.r(t),n.d(t,{frontMatter:()=>p,contentTitle:()=>o,metadata:()=>s,toc:()=>c,default:()=>d});var r=n(7462),i=n(3366),a=(n(7294),n(3905)),l=["components"],p={id:"pvm_gitlab.PublicPerson",title:"Interface: PublicPerson",sidebar_label:"PublicPerson",custom_edit_url:null},o=void 0,s={unversionedId:"api/interfaces/pvm_gitlab.PublicPerson",id:"api/interfaces/pvm_gitlab.PublicPerson",isDocsHomePage:!1,title:"Interface: PublicPerson",description:"@pvm/gitlab.PublicPerson",source:"@site/docs/api/interfaces/pvm_gitlab.PublicPerson.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/pvm_gitlab.PublicPerson",permalink:"/pvm/docs/api/interfaces/pvm_gitlab.PublicPerson",editUrl:null,tags:[],version:"current",frontMatter:{id:"pvm_gitlab.PublicPerson",title:"Interface: PublicPerson",sidebar_label:"PublicPerson",custom_edit_url:null}},c=[{value:"Hierarchy",id:"hierarchy",children:[],level:2},{value:"Properties",id:"properties",children:[{value:"avatar_url",id:"avatar_url",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3},{value:"id",id:"id",children:[{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"name",id:"name",children:[{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3},{value:"state",id:"state",children:[{value:"Defined in",id:"defined-in-3",children:[],level:4}],level:3},{value:"username",id:"username",children:[{value:"Defined in",id:"defined-in-4",children:[],level:4}],level:3},{value:"web_url",id:"web_url",children:[{value:"Defined in",id:"defined-in-5",children:[],level:4}],level:3}],level:2}],u={toc:c};function d(e){var t=e.components,n=(0,i.Z)(e,l);return(0,a.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"../modules/pvm_gitlab"},"@pvm/gitlab"),".PublicPerson"),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"PublicPerson"))),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("a",{parentName:"p",href:"pvm_gitlab.PublicMember"},(0,a.kt)("inlineCode",{parentName:"a"},"PublicMember"))))),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"avatar_url"},"avatar","_","url"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"avatar","_","url"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-gitlab/types/api/people.ts#L16"},"packages/pvm-gitlab/types/api/people.ts:16")),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"id"},"id"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"id"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-gitlab/types/api/people.ts#L12"},"packages/pvm-gitlab/types/api/people.ts:12")),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"name"},"name"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"name"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-gitlab/types/api/people.ts#L13"},"packages/pvm-gitlab/types/api/people.ts:13")),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"state"},"state"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"state"),": ",(0,a.kt)("inlineCode",{parentName:"p"},'"active"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"p"},'"blocked"')),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-gitlab/types/api/people.ts#L15"},"packages/pvm-gitlab/types/api/people.ts:15")),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"username"},"username"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"username"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-gitlab/types/api/people.ts#L14"},"packages/pvm-gitlab/types/api/people.ts:14")),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"web_url"},"web","_","url"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"web","_","url"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-gitlab/types/api/people.ts#L17"},"packages/pvm-gitlab/types/api/people.ts:17")))}d.isMDXComponent=!0}}]);