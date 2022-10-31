"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[7100],{3905:(e,t,a)=>{a.d(t,{Zo:()=>d,kt:()=>c});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},l=Object.keys(e);for(n=0;n<l.length;n++)a=l[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)a=l[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var s=n.createContext({}),m=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},d=function(e){var t=m(e.components);return n.createElement(s.Provider,{value:t},e.children)},o={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,l=e.originalType,s=e.parentName,d=p(e,["components","mdxType","originalType","parentName"]),k=m(a),c=r,u=k["".concat(s,".").concat(c)]||k[c]||o[c]||l;return a?n.createElement(u,i(i({ref:t},d),{},{components:a})):n.createElement(u,i({ref:t},d))}));function c(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=a.length,i=new Array(l);i[0]=k;var p={};for(var s in t)hasOwnProperty.call(t,s)&&(p[s]=t[s]);p.originalType=e,p.mdxType="string"==typeof e?e:r,i[1]=p;for(var m=2;m<l;m++)i[m]=a[m];return n.createElement.apply(null,i)}return n.createElement.apply(null,a)}k.displayName="MDXCreateElement"},4925:(e,t,a)=>{a.r(t),a.d(t,{frontMatter:()=>p,contentTitle:()=>s,metadata:()=>m,toc:()=>d,default:()=>k});var n=a(7462),r=a(3366),l=(a(7294),a(3905)),i=["components"],p={id:"pvm_slack",title:"Module: @pvm/slack",sidebar_label:"@pvm/slack",sidebar_position:0,custom_edit_url:null},s="@pvm/slack",m={unversionedId:"api/modules/pvm_slack",id:"api/modules/pvm_slack",isDocsHomePage:!1,title:"Module: @pvm/slack",description:"Provides client for slack messenger. Client implementing AbstractMessengerClient.",source:"@site/docs/api/modules/pvm_slack.md",sourceDirName:"api/modules",slug:"/api/modules/pvm_slack",permalink:"/pvm/docs/api/modules/pvm_slack",editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"pvm_slack",title:"Module: @pvm/slack",sidebar_label:"@pvm/slack",sidebar_position:0,custom_edit_url:null},sidebar:"API",previous:{title:"@pvm/repository",permalink:"/pvm/docs/api/modules/pvm_repository"},next:{title:"@pvm/suffixes",permalink:"/pvm/docs/api/modules/pvm_suffixes"}},d=[{value:"Enabling in project",id:"enabling-in-project",children:[],level:2},{value:"Classes",id:"classes",children:[],level:2},{value:"Interfaces",id:"interfaces",children:[],level:2},{value:"Functions",id:"functions",children:[{value:"chatPostMessage",id:"chatpostmessage",children:[{value:"Parameters",id:"parameters",children:[],level:4},{value:"Returns",id:"returns",children:[],level:4},{value:"Defined in",id:"defined-in",children:[],level:4}],level:3},{value:"formatText",id:"formattext",children:[{value:"Parameters",id:"parameters-1",children:[],level:4},{value:"Returns",id:"returns-1",children:[],level:4},{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"processMarkdown",id:"processmarkdown",children:[{value:"Parameters",id:"parameters-2",children:[],level:4},{value:"Returns",id:"returns-2",children:[],level:4},{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3},{value:"sendMessage",id:"sendmessage",children:[{value:"Parameters",id:"parameters-3",children:[],level:4},{value:"Returns",id:"returns-3",children:[],level:4},{value:"Defined in",id:"defined-in-3",children:[],level:4}],level:3},{value:"webhookSend",id:"webhooksend",children:[{value:"Parameters",id:"parameters-4",children:[],level:4},{value:"Returns",id:"returns-4",children:[],level:4},{value:"Defined in",id:"defined-in-4",children:[],level:4}],level:3}],level:2}],o={toc:d};function k(e){var t=e.components,a=(0,r.Z)(e,i);return(0,l.kt)("wrapper",(0,n.Z)({},o,a,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("h1",{id:"pvmslack"},"@pvm/slack"),(0,l.kt)("p",null,"Provides client for ",(0,l.kt)("inlineCode",{parentName:"p"},"slack")," messenger. Client implementing ",(0,l.kt)("a",{parentName:"p",href:"/pvm/docs/api/classes/pvm_notifications.AbstractMessengerClient"},"AbstractMessengerClient"),"."),(0,l.kt)("h2",{id:"enabling-in-project"},"Enabling in project"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},".pvm.toml")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-toml"},"...\n[[notifications.clients]]\nname = 'slack'\npkg = '@pvm/slack'\n")),(0,l.kt)("p",null,"After that, depending on settings ",(0,l.kt)("a",{parentName:"p",href:"/pvm/docs/api/interfaces/pvm_core.Config#notifications"},"\u043d\u043e\u0442\u0438\u0444\u0438\u043a\u0430\u0446\u0438\u0439"),", messages will be sending to ",(0,l.kt)("inlineCode",{parentName:"p"},"slack")," messenger"),(0,l.kt)("h2",{id:"classes"},"Classes"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"../classes/pvm_slack.SlackClient"},"SlackClient"))),(0,l.kt)("h2",{id:"interfaces"},"Interfaces"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"../interfaces/pvm_slack.SlackMessage"},"SlackMessage")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"../interfaces/pvm_slack.SlackSendOpts"},"SlackSendOpts"))),(0,l.kt)("h2",{id:"functions"},"Functions"),(0,l.kt)("h3",{id:"chatpostmessage"},"chatPostMessage"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("strong",{parentName:"p"},"chatPostMessage"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"message"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"opts?"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,l.kt)("a",{parentName:"p",href:"../interfaces/pvm_core.HttpResponseSuccess"},(0,l.kt)("inlineCode",{parentName:"a"},"HttpResponseSuccess")),"<",(0,l.kt)("inlineCode",{parentName:"p"},"unknown"),">",">"),(0,l.kt)("h4",{id:"parameters"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"message")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/pvm_slack.SlackMessage"},(0,l.kt)("inlineCode",{parentName:"a"},"SlackMessage")))),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"opts")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/pvm_slack.SlackSendOpts"},(0,l.kt)("inlineCode",{parentName:"a"},"SlackSendOpts")))))),(0,l.kt)("h4",{id:"returns"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,l.kt)("a",{parentName:"p",href:"../interfaces/pvm_core.HttpResponseSuccess"},(0,l.kt)("inlineCode",{parentName:"a"},"HttpResponseSuccess")),"<",(0,l.kt)("inlineCode",{parentName:"p"},"unknown"),">",">"),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-slack/lib/api.ts#L60"},"packages/pvm-slack/lib/api.ts:60")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"formattext"},"formatText"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("strong",{parentName:"p"},"formatText"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"text"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"opts?"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("h4",{id:"parameters-1"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"text")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"string"))),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"opts")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"PrepareTextOptions"))))),(0,l.kt)("h4",{id:"returns-1"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-slack/lib/messaging.ts#L13"},"packages/pvm-slack/lib/messaging.ts:13")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"processmarkdown"},"processMarkdown"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("strong",{parentName:"p"},"processMarkdown"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"text"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("h4",{id:"parameters-2"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"text")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"string"))))),(0,l.kt)("h4",{id:"returns-2"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-slack/lib/messaging.ts#L3"},"packages/pvm-slack/lib/messaging.ts:3")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"sendmessage"},"sendMessage"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("strong",{parentName:"p"},"sendMessage"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"message"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"opts?"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,l.kt)("a",{parentName:"p",href:"../interfaces/pvm_core.HttpResponseSuccess"},(0,l.kt)("inlineCode",{parentName:"a"},"HttpResponseSuccess")),"<",(0,l.kt)("inlineCode",{parentName:"p"},"unknown"),">"," ","|"," ",(0,l.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,l.kt)("h4",{id:"parameters-3"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"message")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/pvm_slack.SlackMessage"},(0,l.kt)("inlineCode",{parentName:"a"},"SlackMessage")))),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"opts")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/pvm_slack.SlackSendOpts"},(0,l.kt)("inlineCode",{parentName:"a"},"SlackSendOpts")))))),(0,l.kt)("h4",{id:"returns-3"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,l.kt)("a",{parentName:"p",href:"../interfaces/pvm_core.HttpResponseSuccess"},(0,l.kt)("inlineCode",{parentName:"a"},"HttpResponseSuccess")),"<",(0,l.kt)("inlineCode",{parentName:"p"},"unknown"),">"," ","|"," ",(0,l.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,l.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-slack/lib/api.ts#L88"},"packages/pvm-slack/lib/api.ts:88")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"webhooksend"},"webhookSend"),(0,l.kt)("p",null,"\u25b8 ",(0,l.kt)("strong",{parentName:"p"},"webhookSend"),"(",(0,l.kt)("inlineCode",{parentName:"p"},"message"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"opts?"),"): ",(0,l.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,l.kt)("a",{parentName:"p",href:"../interfaces/pvm_core.HttpResponseSuccess"},(0,l.kt)("inlineCode",{parentName:"a"},"HttpResponseSuccess")),"<",(0,l.kt)("inlineCode",{parentName:"p"},"unknown"),">",">"),(0,l.kt)("h4",{id:"parameters-4"},"Parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,l.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"message")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/pvm_slack.SlackMessage"},(0,l.kt)("inlineCode",{parentName:"a"},"SlackMessage")))),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("inlineCode",{parentName:"td"},"opts")),(0,l.kt)("td",{parentName:"tr",align:"left"},(0,l.kt)("a",{parentName:"td",href:"../interfaces/pvm_slack.SlackSendOpts"},(0,l.kt)("inlineCode",{parentName:"a"},"SlackSendOpts")))))),(0,l.kt)("h4",{id:"returns-4"},"Returns"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,l.kt)("a",{parentName:"p",href:"../interfaces/pvm_core.HttpResponseSuccess"},(0,l.kt)("inlineCode",{parentName:"a"},"HttpResponseSuccess")),"<",(0,l.kt)("inlineCode",{parentName:"p"},"unknown"),">",">"),(0,l.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-slack/lib/api.ts#L38"},"packages/pvm-slack/lib/api.ts:38")))}k.isMDXComponent=!0}}]);