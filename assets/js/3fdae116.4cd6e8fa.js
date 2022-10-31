"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[5293],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>u});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=r.createContext({}),o=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},c=function(e){var t=o(e.components);return r.createElement(p.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,p=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),m=o(n),u=i,f=m["".concat(p,".").concat(u)]||m[u]||d[u]||a;return n?r.createElement(f,s(s({ref:t},c),{},{components:n})):r.createElement(f,s({ref:t},c))}));function u(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,s=new Array(a);s[0]=m;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:i,s[1]=l;for(var o=2;o<a;o++)s[o]=n[o];return r.createElement.apply(null,s)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},4908:(e,t,n)=>{n.r(t),n.d(t,{frontMatter:()=>l,contentTitle:()=>p,metadata:()=>o,toc:()=>c,default:()=>m});var r=n(7462),i=n(3366),a=(n(7294),n(3905)),s=["components"],l={id:"pvm_notifications.MessengerClients",title:"Class: MessengerClients",sidebar_label:"MessengerClients",custom_edit_url:null},p=void 0,o={unversionedId:"api/classes/pvm_notifications.MessengerClients",id:"api/classes/pvm_notifications.MessengerClients",isDocsHomePage:!1,title:"Class: MessengerClients",description:"@pvm/notifications.MessengerClients",source:"@site/docs/api/classes/pvm_notifications.MessengerClients.md",sourceDirName:"api/classes",slug:"/api/classes/pvm_notifications.MessengerClients",permalink:"/pvm/docs/api/classes/pvm_notifications.MessengerClients",editUrl:null,tags:[],version:"current",frontMatter:{id:"pvm_notifications.MessengerClients",title:"Class: MessengerClients",sidebar_label:"MessengerClients",custom_edit_url:null}},c=[{value:"Constructors",id:"constructors",children:[{value:"constructor",id:"constructor",children:[],level:3}],level:2},{value:"Properties",id:"properties",children:[{value:"messengers",id:"messengers",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3}],level:2},{value:"Methods",id:"methods",children:[{value:"get",id:"get",children:[{value:"Parameters",id:"parameters",children:[],level:4},{value:"Returns",id:"returns",children:[],level:4},{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"getAll",id:"getall",children:[{value:"Returns",id:"returns-1",children:[],level:4},{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3},{value:"getFirstAvailable",id:"getfirstavailable",children:[{value:"Returns",id:"returns-2",children:[],level:4},{value:"Defined in",id:"defined-in-3",children:[],level:4}],level:3},{value:"register",id:"register",children:[{value:"Parameters",id:"parameters-1",children:[],level:4},{value:"Returns",id:"returns-3",children:[],level:4},{value:"Defined in",id:"defined-in-4",children:[],level:4}],level:3}],level:2}],d={toc:c};function m(e){var t=e.components,n=(0,i.Z)(e,s);return(0,a.kt)("wrapper",(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"../modules/pvm_notifications"},"@pvm/notifications"),".MessengerClients"),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new MessengerClients"),"()"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"messengers"},"messengers"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"messengers"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Map"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"string"),", ",(0,a.kt)("a",{parentName:"p",href:"pvm_notifications.AbstractMessengerClient"},(0,a.kt)("inlineCode",{parentName:"a"},"AbstractMessengerClient")),">"),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-notifications/lib/messenger-clients.ts#L4"},"packages/pvm-notifications/lib/messenger-clients.ts:4")),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"get"},"get"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"get"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"name"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"pvm_notifications.AbstractMessengerClient"},(0,a.kt)("inlineCode",{parentName:"a"},"AbstractMessengerClient"))),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"name")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string"))))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"pvm_notifications.AbstractMessengerClient"},(0,a.kt)("inlineCode",{parentName:"a"},"AbstractMessengerClient"))),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-notifications/lib/messenger-clients.ts#L10"},"packages/pvm-notifications/lib/messenger-clients.ts:10")),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"getall"},"getAll"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"getAll"),"(): ",(0,a.kt)("a",{parentName:"p",href:"pvm_notifications.AbstractMessengerClient"},(0,a.kt)("inlineCode",{parentName:"a"},"AbstractMessengerClient")),"[]"),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"pvm_notifications.AbstractMessengerClient"},(0,a.kt)("inlineCode",{parentName:"a"},"AbstractMessengerClient")),"[]"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-notifications/lib/messenger-clients.ts#L14"},"packages/pvm-notifications/lib/messenger-clients.ts:14")),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"getfirstavailable"},"getFirstAvailable"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"getFirstAvailable"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"pvm_notifications.AbstractMessengerClient"},(0,a.kt)("inlineCode",{parentName:"a"},"AbstractMessengerClient"))),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"pvm_notifications.AbstractMessengerClient"},(0,a.kt)("inlineCode",{parentName:"a"},"AbstractMessengerClient"))),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-notifications/lib/messenger-clients.ts#L18"},"packages/pvm-notifications/lib/messenger-clients.ts:18")),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"register"},"register"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"register"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"name"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"client"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"name")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"client")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"pvm_notifications.AbstractMessengerClient"},(0,a.kt)("inlineCode",{parentName:"a"},"AbstractMessengerClient")))))),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"void")),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-notifications/lib/messenger-clients.ts#L6"},"packages/pvm-notifications/lib/messenger-clients.ts:6")))}m.isMDXComponent=!0}}]);