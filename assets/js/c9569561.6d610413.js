"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[4548],{3905:(e,n,t)=>{t.d(n,{Zo:()=>d,kt:()=>f});var i=t(7294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,i,a=function(e,n){if(null==e)return{};var t,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var p=i.createContext({}),s=function(e){var n=i.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},d=function(e){var n=s(e.components);return i.createElement(p.Provider,{value:n},e.children)},m={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},c=i.forwardRef((function(e,n){var t=e.components,a=e.mdxType,r=e.originalType,p=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),c=s(t),f=a,u=c["".concat(p,".").concat(f)]||c[f]||m[f]||r;return t?i.createElement(u,o(o({ref:n},d),{},{components:t})):i.createElement(u,o({ref:n},d))}));function f(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var r=t.length,o=new Array(r);o[0]=c;var l={};for(var p in n)hasOwnProperty.call(n,p)&&(l[p]=n[p]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var s=2;s<r;s++)o[s]=t[s];return i.createElement.apply(null,o)}return i.createElement.apply(null,t)}c.displayName="MDXCreateElement"},2850:(e,n,t)=>{t.r(n),t.d(n,{frontMatter:()=>l,contentTitle:()=>p,metadata:()=>s,toc:()=>d,default:()=>c});var i=t(7462),a=t(3366),r=(t(7294),t(3905)),o=["components"],l={id:"pvm_notifications",title:"Module: @pvm/notifications",sidebar_label:"@pvm/notifications",sidebar_position:0,custom_edit_url:null},p="@pvm/notifications",s={unversionedId:"api/modules/pvm_notifications",id:"api/modules/pvm_notifications",isDocsHomePage:!1,title:"Module: @pvm/notifications",description:"Module used to send messages into specified messengers",source:"@site/docs/api/modules/pvm_notifications.md",sourceDirName:"api/modules",slug:"/api/modules/pvm_notifications",permalink:"/pvm/docs/api/modules/pvm_notifications",editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"pvm_notifications",title:"Module: @pvm/notifications",sidebar_label:"@pvm/notifications",sidebar_position:0,custom_edit_url:null},sidebar:"API",previous:{title:"@pvm/mattermost",permalink:"/pvm/docs/api/modules/pvm_mattermost"},next:{title:"@pvm/pkgset",permalink:"/pvm/docs/api/modules/pvm_pkgset"}},d=[{value:"Configuration",id:"configuration",children:[],level:2},{value:"Node API",id:"node-api",children:[],level:2},{value:"CLI",id:"cli",children:[{value:"<code>pvm notification send</code>",id:"pvm-notification-send",children:[],level:3}],level:2},{value:"Classes",id:"classes",children:[],level:2},{value:"Properties",id:"properties",children:[{value:"default",id:"default",children:[],level:3}],level:2},{value:"Variables",id:"variables",children:[{value:"command",id:"command",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3},{value:"description",id:"description",children:[{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"logger",id:"logger",children:[{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3}],level:2},{value:"Functions",id:"functions",children:[{value:"builder",id:"builder",children:[{value:"Parameters",id:"parameters",children:[],level:4},{value:"Returns",id:"returns",children:[],level:4},{value:"Defined in",id:"defined-in-3",children:[],level:4}],level:3},{value:"handler",id:"handler",children:[{value:"Parameters",id:"parameters-1",children:[],level:4},{value:"Returns",id:"returns-1",children:[],level:4},{value:"Defined in",id:"defined-in-4",children:[],level:4}],level:3}],level:2}],m={toc:d};function c(e){var n=e.components,t=(0,a.Z)(e,o);return(0,r.kt)("wrapper",(0,i.Z)({},m,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"pvmnotifications"},"@pvm/notifications"),(0,r.kt)("p",null,"Module used to send messages into specified messengers"),(0,r.kt)("h2",{id:"configuration"},(0,r.kt)("a",{parentName:"h2",href:"/pvm/docs/api/interfaces/pvm_core.Config#notifications"},"Configuration")),(0,r.kt)("p",null,"Configuration ",(0,r.kt)("a",{parentName:"p",href:"/pvm/docs/api/interfaces/pvm_core.Config#notifications"},"defaults")," provide values\nthat will be used as defaults for message when ",(0,r.kt)("inlineCode",{parentName:"p"},"sendMessage")," called."),(0,r.kt)("h2",{id:"node-api"},"Node API"),(0,r.kt)("p",null,"Main api entry point is ",(0,r.kt)("a",{parentName:"p",href:"../classes/pvm_notifications.Notificator"},"Notificator")," class. It's interface\npublic methods are appear to be public api."),(0,r.kt)("p",null,"Example"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { Notificator } from '@pvm/notifications'\n\nasync function send(channel: string, content: string) {\n  const notificator = await Notificator.create()\n  notificator.sendMessage({\n    channel,  \n    content\n  })\n}\n")),(0,r.kt)("h2",{id:"cli"},"CLI"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},"yarn run v1.22.19\n$ /__w/pvm/pvm/node_modules/.bin/pvm notification --help\npvm notification <command>\n\nSend messages to messenger(s)\n\nCommands:\n  pvm notification send  Send message to configured messengers\n\nOptions:\n  --version  Show version number                                                           [boolean]\n  ----help   Show help                                                                     [boolean]\nDone in 1.30s.\n\n")),(0,r.kt)("h3",{id:"pvm-notification-send"},(0,r.kt)("inlineCode",{parentName:"h3"},"pvm notification send")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},'yarn run v1.22.19\n$ /__w/pvm/pvm/node_modules/.bin/pvm notification send --help\npvm notification send\n\nSend message to configured messengers\n\nOptions:\n      --version  Show version number                                                       [boolean]\n      ----help   Show help                                                                 [boolean]\n  -t, --target   target messenger or list of them. Possible values are: all, first-available and\n                 concrete messenger name                                                     [array]\n  -f, --file     message json file. Available fields described in doc\n                 https://tinkoff.github.io/pvm/docs/api/modules/pvm_types#message\n  -c, --channel  channel where to send message\n  -m, --message  text for sending. Use "-" for reading from stdin. Default: "-" if there is no\n                 message nor text passed.\n\nExamples:\n  pvm notification send -m message.json  Send message to messengers according to pvm configuration\nDone in 1.27s.\n\n')),(0,r.kt)("h2",{id:"classes"},"Classes"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"../classes/pvm_notifications.AbstractMessengerClient"},"AbstractMessengerClient")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"../classes/pvm_notifications.MessengerClients"},"MessengerClients")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"../classes/pvm_notifications.Notificator"},"Notificator"))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"default"},"default"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"default"),": { ",(0,r.kt)("inlineCode",{parentName:"p"},"configExt"),": ",(0,r.kt)("a",{parentName:"p",href:"pvm_types#recursivepartial"},(0,r.kt)("inlineCode",{parentName:"a"},"RecursivePartial")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Config"),">"," ; ",(0,r.kt)("inlineCode",{parentName:"p"},"factory"),": ",(0,r.kt)("a",{parentName:"p",href:"pvm_types#pluginfactory"},(0,r.kt)("inlineCode",{parentName:"a"},"PluginFactory"))," ; ",(0,r.kt)("inlineCode",{parentName:"p"},"name"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = ","_","_","filename } ","|"," { ",(0,r.kt)("inlineCode",{parentName:"p"},"factory"),": ",(0,r.kt)("a",{parentName:"p",href:"pvm_types#pluginfactory"},(0,r.kt)("inlineCode",{parentName:"a"},"PluginFactory"))," ; ",(0,r.kt)("inlineCode",{parentName:"p"},"name"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = ","_","_","filename } ","|"," { ",(0,r.kt)("inlineCode",{parentName:"p"},"configExt"),": ",(0,r.kt)("a",{parentName:"p",href:"pvm_types#recursivepartial"},(0,r.kt)("inlineCode",{parentName:"a"},"RecursivePartial")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Config"),">"," ; ",(0,r.kt)("inlineCode",{parentName:"p"},"name"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = ","_","_","filename }"),(0,r.kt)("h2",{id:"variables"},"Variables"),(0,r.kt)("h3",{id:"command"},"command"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"command"),": ",(0,r.kt)("inlineCode",{parentName:"p"},'"send"')),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-notifications/cli/commands/pvm-notification-send.ts#L9"},"packages/pvm-notifications/cli/commands/pvm-notification-send.ts:9")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"description"},"description"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"description"),": ",(0,r.kt)("inlineCode",{parentName:"p"},'"Send message to configured messengers"')),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-notifications/cli/commands/pvm-notification-send.ts#L10"},"packages/pvm-notifications/cli/commands/pvm-notification-send.ts:10")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"logger"},"logger"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"logger"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"SignaleType"),"<",(0,r.kt)("inlineCode",{parentName:"p"},'"debug"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},'"silly"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},'"deprecate"'),", ",(0,r.kt)("inlineCode",{parentName:"p"},"never"),">"),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-notifications/lib/logger.ts#L3"},"packages/pvm-notifications/lib/logger.ts:3")),(0,r.kt)("h2",{id:"functions"},"Functions"),(0,r.kt)("h3",{id:"builder"},"builder"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Const")," ",(0,r.kt)("strong",{parentName:"p"},"builder"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"yargs"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"Argv"),"<{ ",(0,r.kt)("inlineCode",{parentName:"p"},"target"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," (",(0,r.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number"),")[]  } & { ",(0,r.kt)("inlineCode",{parentName:"p"},"file"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"unknown"),"  } & { ",(0,r.kt)("inlineCode",{parentName:"p"},"channel"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"unknown"),"  } & { ",(0,r.kt)("inlineCode",{parentName:"p"},"message"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"unknown"),"  }",">"),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"yargs")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Argv"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Object"),">")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Argv"),"<{ ",(0,r.kt)("inlineCode",{parentName:"p"},"target"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," (",(0,r.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"number"),")[]  } & { ",(0,r.kt)("inlineCode",{parentName:"p"},"file"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"unknown"),"  } & { ",(0,r.kt)("inlineCode",{parentName:"p"},"channel"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"unknown"),"  } & { ",(0,r.kt)("inlineCode",{parentName:"p"},"message"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"unknown"),"  }",">"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-notifications/cli/commands/pvm-notification-send.ts#L11"},"packages/pvm-notifications/cli/commands/pvm-notification-send.ts:11")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"handler"},"handler"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Const")," ",(0,r.kt)("strong",{parentName:"p"},"handler"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"flags"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"flags")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"any"))))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-notifications/cli/commands/pvm-notification-send.ts#L35"},"packages/pvm-notifications/cli/commands/pvm-notification-send.ts:35")))}c.isMDXComponent=!0}}]);