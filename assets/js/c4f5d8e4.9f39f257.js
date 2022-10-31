"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[4195,9514],{5239:(e,t,a)=>{a.r(t),a.d(t,{default:()=>u});var n=a(7294),r=a(6010),c=a(1022),l=a(9960),o=a(2263),s=a(4996);const i={heroBanner:"heroBanner_3P7f",buttons:"buttons_1r9m",section:"section_1DfF",featureImage:"featureImage_ZtzX",heroLogo:"heroLogo_3Bfc",rotateIn:"rotateIn_3wDV",getStartedBtn:"getStartedBtn_teQY"};var m=[{title:n.createElement(n.Fragment,null,"Any number of packages"),imageUrl:"img/undraw_dilvers_pkg.svg",description:n.createElement(n.Fragment,null,"Pvm supports both multi-package (aka monorepository) and single-package repositories.")},{title:n.createElement(n.Fragment,null),imageUrl:"img/undraw_analyze_17kw.svg",description:n.createElement(n.Fragment,null,"Covered by tests")},{title:n.createElement(n.Fragment,null,"Easy to configure and extend"),imageUrl:"img/undraw_coding_6mjf.svg",description:n.createElement(n.Fragment,null,"Via .pvm.toml file and plugins you can configure and extend behavior of your releasing process.")}];const u=function(){var e=(0,o.Z)().siteConfig,t=void 0===e?{}:e;return n.createElement(c.Z,{title:t.title,description:t.tagline},n.createElement("header",{className:(0,r.Z)("hero hero--primary",i.heroBanner)},n.createElement("div",{className:"container"},n.createElement("h1",{className:"hero__title"},n.createElement("img",{src:(0,s.Z)("img/pvm.svg"),alt:"logo",className:i.heroLogo}),n.createElement("span",null,t.title)),n.createElement("p",{className:"hero__subtitle"},t.tagline),n.createElement("div",{className:i.buttons},n.createElement(l.Z,{className:(0,r.Z)(i.getStartedBtn,"button button--secondary button--lg"),to:(0,s.Z)("docs/book/get-started/overview")},"Get Started")))),n.createElement("main",null,m&&m.length&&n.createElement("section",{className:i.section},n.createElement("div",{className:"container text--center margin-bottom--xl"},n.createElement("div",{className:"row"},m.map((function(e,t){var a=e.imageUrl,c=e.title,l=e.description;return n.createElement("div",{key:t,className:(0,r.Z)("col col--4",i.feature)},a&&n.createElement("div",{className:"text--center"},n.createElement("img",{className:i.featureImage,src:(0,s.Z)(a),alt:c})),n.createElement("h3",null,c),n.createElement("p",null,l))})))),n.createElement("div",{className:"container text--center"},n.createElement("div",{className:"row"},n.createElement("div",{className:"col col--4 col--offset-1"},n.createElement("img",{src:(0,s.Z)("img/undraw_Selection_re_poer.svg"),alt:"Automatic changelog generation"}),n.createElement("h3",null,"Automatic changelog generation"),n.createElement("p",{className:"padding-horiz--md"},"Pvm can automatically maintain changelog for you. You can choose one of built-in renderers or \xa0",n.createElement(l.Z,{to:"https://github.com/conventional-changelog/conventional-changelog"},"conventional-changelog"),"\xa0 for convert your commit messages to changelogs.")),n.createElement("div",{className:"col col--4 col--offset-2"},n.createElement("img",{src:(0,s.Z)("img/undraw_reminders_697p.svg"),alt:"Slack notifications"}),n.createElement("h3",null,"Slack notifications"),n.createElement("p",{className:"padding-horiz--md"},"After success release pvm can notify team about published packages with link to updated changelog.")))))))}},6979:(e,t,a)=>{a.d(t,{Z:()=>s});var n=a(7294),r=a(4184),c=a.n(r),l=a(6775),o=a(2263);const s=function(e){var t=(0,n.useRef)(!1),r=(0,n.useRef)(null),s=(0,l.k6)(),i=(0,o.Z)().siteConfig,m=(void 0===i?{}:i).baseUrl,u=function(){t.current||(Promise.all([fetch(m+"search-doc.json").then((function(e){return e.json()})),fetch(m+"lunr-index.json").then((function(e){return e.json()})),Promise.all([a.e(432),a.e(1245)]).then(a.bind(a,4130)),Promise.all([a.e(532),a.e(3343)]).then(a.bind(a,3343))]).then((function(e){!function(e,t,a){new a({searchDocs:e,searchIndex:t,inputSelector:"#search_input_react",handleSelected:function(e,t,a){var n=m+a.url;document.createElement("a").href=n,s.push(n)}})}(e[0],e[1],e[2].default)})),t.current=!0)},d=(0,n.useCallback)((function(t){r.current.contains(t.target)||r.current.focus(),e.handleSearchBarToggle(!e.isSearchBarExpanded)}),[e.isSearchBarExpanded]);return n.createElement("div",{className:"navbar__search",key:"search-box"},n.createElement("span",{"aria-label":"expand searchbar",role:"button",className:c()("search-icon",{"search-icon-hidden":e.isSearchBarExpanded}),onClick:d,onKeyDown:d,tabIndex:0}),n.createElement("input",{id:"search_input_react",type:"search",placeholder:"Search","aria-label":"Search",className:c()("navbar__search-input",{"search-bar-expanded":e.isSearchBarExpanded},{"search-bar":!e.isSearchBarExpanded}),onClick:u,onMouseOver:u,onFocus:d,onBlur:d,ref:r}))}}}]);