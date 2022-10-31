"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[7644],{3905:(e,t,a)=>{a.d(t,{Zo:()=>d,kt:()=>k});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var s=n.createContext({}),m=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},d=function(e){var t=m(e.components);return n.createElement(s.Provider,{value:t},e.children)},o={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,d=p(e,["components","mdxType","originalType","parentName"]),c=m(a),k=r,v=c["".concat(s,".").concat(k)]||c[k]||o[k]||i;return a?n.createElement(v,l(l({ref:t},d),{},{components:a})):n.createElement(v,l({ref:t},d))}));function k(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=c;var p={};for(var s in t)hasOwnProperty.call(t,s)&&(p[s]=t[s]);p.originalType=e,p.mdxType="string"==typeof e?e:r,l[1]=p;for(var m=2;m<i;m++)l[m]=a[m];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}c.displayName="MDXCreateElement"},9896:(e,t,a)=>{a.r(t),a.d(t,{frontMatter:()=>p,contentTitle:()=>s,metadata:()=>m,toc:()=>d,default:()=>c});var n=a(7462),r=a(3366),i=(a(7294),a(3905)),l=["components"],p={id:"pvm_vcs",title:"Module: @pvm/vcs",sidebar_label:"@pvm/vcs",sidebar_position:0,custom_edit_url:null},s="@pvm/vcs",m={unversionedId:"api/modules/pvm_vcs",id:"api/modules/pvm_vcs",isDocsHomePage:!1,title:"Module: @pvm/vcs",description:"Classes",source:"@site/docs/api/modules/pvm_vcs.md",sourceDirName:"api/modules",slug:"/api/modules/pvm_vcs",permalink:"/pvm/docs/api/modules/pvm_vcs",editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"pvm_vcs",title:"Module: @pvm/vcs",sidebar_label:"@pvm/vcs",sidebar_position:0,custom_edit_url:null},sidebar:"API",previous:{title:"@pvm/update",permalink:"/pvm/docs/api/modules/pvm_update"},next:{title:"@pvm/vcs-fs",permalink:"/pvm/docs/api/modules/pvm_vcs_fs"}},d=[{value:"Classes",id:"classes",children:[],level:2},{value:"Interfaces",id:"interfaces",children:[],level:2},{value:"Type aliases",id:"type-aliases",children:[{value:"GetReleaseResult",id:"getreleaseresult",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3}],level:2},{value:"Properties",id:"properties",children:[{value:"default",id:"default",children:[],level:3}],level:2},{value:"Variables",id:"variables",children:[{value:"command",id:"command",children:[{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"description",id:"description",children:[{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3}],level:2},{value:"Functions",id:"functions",children:[{value:"builder",id:"builder",children:[{value:"Parameters",id:"parameters",children:[],level:4},{value:"Returns",id:"returns",children:[],level:4},{value:"Defined in",id:"defined-in-3",children:[],level:4}],level:3},{value:"getNoteBody",id:"getnotebody",children:[{value:"Parameters",id:"parameters-1",children:[],level:4},{value:"Returns",id:"returns-1",children:[],level:4},{value:"Defined in",id:"defined-in-4",children:[],level:4}],level:3},{value:"handler",id:"handler",children:[{value:"Returns",id:"returns-2",children:[],level:4},{value:"Defined in",id:"defined-in-5",children:[],level:4}],level:3},{value:"initVcsPlatform",id:"initvcsplatform",children:[{value:"Parameters",id:"parameters-2",children:[],level:4},{value:"Returns",id:"returns-3",children:[],level:4},{value:"Defined in",id:"defined-in-6",children:[],level:4}],level:3},{value:"lazyInitVcs",id:"lazyinitvcs",children:[{value:"Parameters",id:"parameters-3",children:[],level:4},{value:"Returns",id:"returns-4",children:[],level:4},{value:"Defined in",id:"defined-in-7",children:[],level:4}],level:3}],level:2}],o={toc:d};function c(e){var t=e.components,a=(0,r.Z)(e,l);return(0,i.kt)("wrapper",(0,n.Z)({},o,a,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"pvmvcs"},"@pvm/vcs"),(0,i.kt)("h2",{id:"classes"},"Classes"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../classes/pvm_vcs.PlatformInterface"},"PlatformInterface")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../classes/pvm_vcs.PlatformInterfaceWithFileCommitApi"},"PlatformInterfaceWithFileCommitApi")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../classes/pvm_vcs.VcsOnlyStenographer"},"VcsOnlyStenographer")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../classes/pvm_vcs.VcsPlatform"},"VcsPlatform"))),(0,i.kt)("h2",{id:"interfaces"},"Interfaces"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.AbstractVcs"},"AbstractVcs")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.AddTagOptions"},"AddTagOptions")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.AlterReleaseResult"},"AlterReleaseResult")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.CommitOptions"},"CommitOptions")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.CommitResult"},"CommitResult")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.CreateReleasePayload"},"CreateReleasePayload")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.FileCommitApi"},"FileCommitApi")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.LineEntry"},"LineEntry")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.MetaComment"},"MetaComment")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.PlatformRelease"},"PlatformRelease")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.PlatformReleaseTag"},"PlatformReleaseTag")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.PushError"},"PushError")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.PushOptions"},"PushOptions")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.ReleasePayload"},"ReleasePayload")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.UnknownCommitContext"},"UnknownCommitContext")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.VcsOnly"},"VcsOnly")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"../interfaces/pvm_vcs.VcsRelease"},"VcsRelease"))),(0,i.kt)("h2",{id:"type-aliases"},"Type aliases"),(0,i.kt)("h3",{id:"getreleaseresult"},"GetReleaseResult"),(0,i.kt)("p",null,"\u01ac ",(0,i.kt)("strong",{parentName:"p"},"GetReleaseResult"),": [",(0,i.kt)("a",{parentName:"p",href:"../enums/pvm_core.PlatformResult#ok"},(0,i.kt)("inlineCode",{parentName:"a"},"OK")),", ",(0,i.kt)("a",{parentName:"p",href:"../interfaces/pvm_vcs.PlatformRelease"},(0,i.kt)("inlineCode",{parentName:"a"},"PlatformRelease")),"] ","|"," [",(0,i.kt)("a",{parentName:"p",href:"../enums/pvm_core.PlatformResult#not_found"},(0,i.kt)("inlineCode",{parentName:"a"},"NOT_FOUND"))," ","|"," ",(0,i.kt)("a",{parentName:"p",href:"../enums/pvm_core.PlatformResult#no_such_tag"},(0,i.kt)("inlineCode",{parentName:"a"},"NO_SUCH_TAG")),", ",(0,i.kt)("inlineCode",{parentName:"p"},"null"),"]"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-vcs/types/index.ts#L82"},"packages/pvm-vcs/types/index.ts:82")),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"default"},"default"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"default"),": { ",(0,i.kt)("inlineCode",{parentName:"p"},"configExt"),": ",(0,i.kt)("a",{parentName:"p",href:"pvm_types#recursivepartial"},(0,i.kt)("inlineCode",{parentName:"a"},"RecursivePartial")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Config"),">"," ; ",(0,i.kt)("inlineCode",{parentName:"p"},"factory"),": ",(0,i.kt)("a",{parentName:"p",href:"pvm_types#pluginfactory"},(0,i.kt)("inlineCode",{parentName:"a"},"PluginFactory"))," ; ",(0,i.kt)("inlineCode",{parentName:"p"},"name"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = ","_","_","filename } ","|"," { ",(0,i.kt)("inlineCode",{parentName:"p"},"factory"),": ",(0,i.kt)("a",{parentName:"p",href:"pvm_types#pluginfactory"},(0,i.kt)("inlineCode",{parentName:"a"},"PluginFactory"))," ; ",(0,i.kt)("inlineCode",{parentName:"p"},"name"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = ","_","_","filename } ","|"," { ",(0,i.kt)("inlineCode",{parentName:"p"},"configExt"),": ",(0,i.kt)("a",{parentName:"p",href:"pvm_types#recursivepartial"},(0,i.kt)("inlineCode",{parentName:"a"},"RecursivePartial")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Config"),">"," ; ",(0,i.kt)("inlineCode",{parentName:"p"},"name"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = ","_","_","filename }"),(0,i.kt)("h2",{id:"variables"},"Variables"),(0,i.kt)("h3",{id:"command"},"command"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"command"),": ",(0,i.kt)("inlineCode",{parentName:"p"},'"vcs <command>"')),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-vcs/cli/pvm-vcs.ts#L51"},"packages/pvm-vcs/cli/pvm-vcs.ts:51")),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"description"},"description"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"description"),": ",(0,i.kt)("inlineCode",{parentName:"p"},'"cli for version control system"')),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-vcs/cli/pvm-vcs.ts#L52"},"packages/pvm-vcs/cli/pvm-vcs.ts:52")),(0,i.kt)("h2",{id:"functions"},"Functions"),(0,i.kt)("h3",{id:"builder"},"builder"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Const")," ",(0,i.kt)("strong",{parentName:"p"},"builder"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"yargs"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"Argv"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Object"),">"),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"yargs")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"Argv"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"Object"),">")))),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Argv"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"Object"),">"),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-vcs/cli/pvm-vcs.ts#L53"},"packages/pvm-vcs/cli/pvm-vcs.ts:53")),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"getnotebody"},"getNoteBody"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"getNoteBody"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"frontMatter"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"text"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"frontMatter")),(0,i.kt)("td",{parentName:"tr",align:"left"},"[",(0,i.kt)("inlineCode",{parentName:"td"},"string"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"string"),"][]")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"text")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"string"))))),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"string")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-vcs/lib/utils.ts#L2"},"packages/pvm-vcs/lib/utils.ts:2")),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"handler"},"handler"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Const")," ",(0,i.kt)("strong",{parentName:"p"},"handler"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-vcs/cli/pvm-vcs.ts#L85"},"packages/pvm-vcs/cli/pvm-vcs.ts:85")),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"initvcsplatform"},"initVcsPlatform"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"initVcsPlatform"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"opts?"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("a",{parentName:"p",href:"../classes/pvm_vcs.VcsPlatform"},(0,i.kt)("inlineCode",{parentName:"a"},"VcsPlatform")),">"),(0,i.kt)("h4",{id:"parameters-2"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"opts")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"InitVcsOpts"))))),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("a",{parentName:"p",href:"../classes/pvm_vcs.VcsPlatform"},(0,i.kt)("inlineCode",{parentName:"a"},"VcsPlatform")),">"),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-vcs/lib/vcs.ts#L311"},"packages/pvm-vcs/lib/vcs.ts:311")),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"lazyinitvcs"},"lazyInitVcs"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"lazyInitVcs"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"cwd"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"opts?"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("a",{parentName:"p",href:"../classes/pvm_vcs.VcsPlatform"},(0,i.kt)("inlineCode",{parentName:"a"},"VcsPlatform")),">"),(0,i.kt)("h4",{id:"parameters-3"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"cwd")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"string"))),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"opts")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,i.kt)("inlineCode",{parentName:"td"},"InitVcsOpts"),", ",(0,i.kt)("inlineCode",{parentName:"td"},'"cwd"'),">")))),(0,i.kt)("h4",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("a",{parentName:"p",href:"../classes/pvm_vcs.VcsPlatform"},(0,i.kt)("inlineCode",{parentName:"a"},"VcsPlatform")),">"),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/Tinkoff/pvm/tree/master/packages/pvm-vcs/lib/vcs.ts#L337"},"packages/pvm-vcs/lib/vcs.ts:337")))}c.isMDXComponent=!0}}]);