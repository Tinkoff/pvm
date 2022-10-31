"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[8977],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>c});var i=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=i.createContext({}),u=function(e){var t=i.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},d=function(e){var t=u(e.components);return i.createElement(o.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},m=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,r=e.originalType,o=e.parentName,d=p(e,["components","mdxType","originalType","parentName"]),m=u(n),c=a,g=m["".concat(o,".").concat(c)]||m[c]||s[c]||r;return n?i.createElement(g,l(l({ref:t},d),{},{components:n})):i.createElement(g,l({ref:t},d))}));function c(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=n.length,l=new Array(r);l[0]=m;var p={};for(var o in t)hasOwnProperty.call(t,o)&&(p[o]=t[o]);p.originalType=e,p.mdxType="string"==typeof e?e:a,l[1]=p;for(var u=2;u<r;u++)l[u]=n[u];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}m.displayName="MDXCreateElement"},8161:(e,t,n)=>{n.r(t),n.d(t,{frontMatter:()=>p,contentTitle:()=>o,metadata:()=>u,toc:()=>d,default:()=>m});var i=n(7462),a=n(3366),r=(n(7294),n(3905)),l=["components"],p={id:"pvm_plugin_github",title:"Module: @pvm/plugin-github",sidebar_label:"@pvm/plugin-github",sidebar_position:0,custom_edit_url:null},o="@pvm/plugin-github",u={unversionedId:"api/modules/pvm_plugin_github",id:"api/modules/pvm_plugin_github",isDocsHomePage:!1,title:"Module: @pvm/plugin-github",description:"Classes",source:"@site/docs/api/modules/pvm_plugin_github.md",sourceDirName:"api/modules",slug:"/api/modules/pvm_plugin_github",permalink:"/pvm/docs/api/modules/pvm_plugin_github",editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"pvm_plugin_github",title:"Module: @pvm/plugin-github",sidebar_label:"@pvm/plugin-github",sidebar_position:0,custom_edit_url:null},sidebar:"API",previous:{title:"@pvm/plugin-core",permalink:"/pvm/docs/api/modules/pvm_plugin_core"},next:{title:"@pvm/plugin-http-proxy",permalink:"/pvm/docs/api/modules/pvm_plugin_http_proxy"}},d=[{value:"Classes",id:"classes",children:[],level:2},{value:"Type aliases",id:"type-aliases",children:[{value:"IssueComment",id:"issuecomment",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3},{value:"PullRequest",id:"pullrequest",children:[{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3}],level:2},{value:"Properties",id:"properties",children:[{value:"default",id:"default",children:[],level:3}],level:2},{value:"Variables",id:"variables",children:[{value:"AuthenticationStrategy",id:"authenticationstrategy",children:[{value:"Type declaration",id:"type-declaration",children:[],level:4},{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3},{value:"log",id:"log",children:[{value:"Defined in",id:"defined-in-3",children:[],level:4}],level:3}],level:2}],s={toc:d};function m(e){var t=e.components,n=(0,a.Z)(e,l);return(0,r.kt)("wrapper",(0,i.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"pvmplugin-github"},"@pvm/plugin-github"),(0,r.kt)("h2",{id:"classes"},"Classes"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"../classes/pvm_plugin_github.GithubPlatform"},"GithubPlatform"))),(0,r.kt)("h2",{id:"type-aliases"},"Type aliases"),(0,r.kt)("h3",{id:"issuecomment"},"IssueComment"),(0,r.kt)("p",null,"\u01ac ",(0,r.kt)("strong",{parentName:"p"},"IssueComment"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"githubApiTypes.components"),"[",(0,r.kt)("inlineCode",{parentName:"p"},'"schemas"'),'][``"issue-comment"``]'),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/src/plugins/github/types.ts#L4"},"src/plugins/github/types.ts:4")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"pullrequest"},"PullRequest"),(0,r.kt)("p",null,"\u01ac ",(0,r.kt)("strong",{parentName:"p"},"PullRequest"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"githubApiTypes.components"),"[",(0,r.kt)("inlineCode",{parentName:"p"},'"schemas"'),'][``"pull-request-minimal"``]'),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/src/plugins/github/types.ts#L3"},"src/plugins/github/types.ts:3")),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"default"},"default"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"default"),": { ",(0,r.kt)("inlineCode",{parentName:"p"},"configExt"),": ",(0,r.kt)("a",{parentName:"p",href:"pvm_types#recursivepartial"},(0,r.kt)("inlineCode",{parentName:"a"},"RecursivePartial")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Config"),">"," ; ",(0,r.kt)("inlineCode",{parentName:"p"},"factory"),": ",(0,r.kt)("a",{parentName:"p",href:"pvm_types#pluginfactory"},(0,r.kt)("inlineCode",{parentName:"a"},"PluginFactory"))," ; ",(0,r.kt)("inlineCode",{parentName:"p"},"name"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = ","_","_","filename } ","|"," { ",(0,r.kt)("inlineCode",{parentName:"p"},"factory"),": ",(0,r.kt)("a",{parentName:"p",href:"pvm_types#pluginfactory"},(0,r.kt)("inlineCode",{parentName:"a"},"PluginFactory"))," ; ",(0,r.kt)("inlineCode",{parentName:"p"},"name"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = ","_","_","filename } ","|"," { ",(0,r.kt)("inlineCode",{parentName:"p"},"configExt"),": ",(0,r.kt)("a",{parentName:"p",href:"pvm_types#recursivepartial"},(0,r.kt)("inlineCode",{parentName:"a"},"RecursivePartial")),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Config"),">"," ; ",(0,r.kt)("inlineCode",{parentName:"p"},"name"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = ","_","_","filename }"),(0,r.kt)("h2",{id:"variables"},"Variables"),(0,r.kt)("h3",{id:"authenticationstrategy"},"AuthenticationStrategy"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"AuthenticationStrategy"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Object")),(0,r.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"authAction")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"StrategyInterface"),"<[], [], ",(0,r.kt)("inlineCode",{parentName:"td"},"Authentication"),">")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"authApp")),(0,r.kt)("td",{parentName:"tr",align:"left"},"(",(0,r.kt)("inlineCode",{parentName:"td"},"options"),": ",(0,r.kt)("inlineCode",{parentName:"td"},"StrategyOptions"),") => ",(0,r.kt)("inlineCode",{parentName:"td"},"AuthInterface"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"authToken")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined"))))),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/src/plugins/github/platform.ts#L26"},"src/plugins/github/platform.ts:26")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"log"},"log"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"log"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"SignaleType"),"<",(0,r.kt)("inlineCode",{parentName:"p"},'"debug"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},'"silly"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},'"deprecate"'),", ",(0,r.kt)("inlineCode",{parentName:"p"},"never"),">"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/src/plugins/github/logger.ts#L3"},"src/plugins/github/logger.ts:3")))}m.isMDXComponent=!0}}]);