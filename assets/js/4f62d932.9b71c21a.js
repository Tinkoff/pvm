"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9863],{3905:(e,t,n)=>{n.d(t,{Zo:()=>o,kt:()=>m});var a=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=a.createContext({}),s=function(e){var t=a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},o=function(e){var t=s(e.components);return a.createElement(c.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},k=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,l=e.originalType,c=e.parentName,o=p(e,["components","mdxType","originalType","parentName"]),k=s(n),m=i,u=k["".concat(c,".").concat(m)]||k[m]||d[m]||l;return n?a.createElement(u,r(r({ref:t},o),{},{components:n})):a.createElement(u,r({ref:t},o))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var l=n.length,r=new Array(l);r[0]=k;var p={};for(var c in t)hasOwnProperty.call(t,c)&&(p[c]=t[c]);p.originalType=e,p.mdxType="string"==typeof e?e:i,r[1]=p;for(var s=2;s<l;s++)r[s]=n[s];return a.createElement.apply(null,r)}return a.createElement.apply(null,n)}k.displayName="MDXCreateElement"},6653:(e,t,n)=>{n.r(t),n.d(t,{frontMatter:()=>p,contentTitle:()=>c,metadata:()=>s,toc:()=>o,default:()=>k});var a=n(7462),i=n(3366),l=(n(7294),n(3905)),r=["components"],p={id:"pvm_slack.SlackMessage",title:"Interface: SlackMessage",sidebar_label:"SlackMessage",custom_edit_url:null},c=void 0,s={unversionedId:"api/interfaces/pvm_slack.SlackMessage",id:"api/interfaces/pvm_slack.SlackMessage",isDocsHomePage:!1,title:"Interface: SlackMessage",description:"@pvm/slack.SlackMessage",source:"@site/docs/api/interfaces/pvm_slack.SlackMessage.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/pvm_slack.SlackMessage",permalink:"/pvm/docs/api/interfaces/pvm_slack.SlackMessage",editUrl:null,tags:[],version:"current",frontMatter:{id:"pvm_slack.SlackMessage",title:"Interface: SlackMessage",sidebar_label:"SlackMessage",custom_edit_url:null}},o=[{value:"Properties",id:"properties",children:[{value:"attachments",id:"attachments",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3},{value:"blocks",id:"blocks",children:[{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"channel",id:"channel",children:[{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3},{value:"icon_emoji",id:"icon_emoji",children:[{value:"Defined in",id:"defined-in-3",children:[],level:4}],level:3},{value:"icon_url",id:"icon_url",children:[{value:"Defined in",id:"defined-in-4",children:[],level:4}],level:3},{value:"text",id:"text",children:[{value:"Defined in",id:"defined-in-5",children:[],level:4}],level:3},{value:"username",id:"username",children:[{value:"Defined in",id:"defined-in-6",children:[],level:4}],level:3}],level:2}],d={toc:o};function k(e){var t=e.components,n=(0,i.Z)(e,r);return(0,l.kt)("wrapper",(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"../modules/pvm_slack"},"@pvm/slack"),".SlackMessage"),(0,l.kt)("h2",{id:"properties"},"Properties"),(0,l.kt)("h3",{id:"attachments"},"attachments"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("strong",{parentName:"p"},"attachments"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"any"),"[]"),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-slack/lib/api.ts#L16"},"packages/pvm-slack/lib/api.ts:16")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"blocks"},"blocks"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("strong",{parentName:"p"},"blocks"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"any"),"[]"),(0,l.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-slack/lib/api.ts#L15"},"packages/pvm-slack/lib/api.ts:15")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"channel"},"channel"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("strong",{parentName:"p"},"channel"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-slack/lib/api.ts#L19"},"packages/pvm-slack/lib/api.ts:19")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"icon_emoji"},"icon","_","emoji"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("strong",{parentName:"p"},"icon","_","emoji"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-slack/lib/api.ts#L17"},"packages/pvm-slack/lib/api.ts:17")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"icon_url"},"icon","_","url"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("strong",{parentName:"p"},"icon","_","url"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-slack/lib/api.ts#L18"},"packages/pvm-slack/lib/api.ts:18")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"text"},"text"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("strong",{parentName:"p"},"text"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-slack/lib/api.ts#L14"},"packages/pvm-slack/lib/api.ts:14")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"username"},"username"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("strong",{parentName:"p"},"username"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-slack/lib/api.ts#L13"},"packages/pvm-slack/lib/api.ts:13")))}k.isMDXComponent=!0}}]);