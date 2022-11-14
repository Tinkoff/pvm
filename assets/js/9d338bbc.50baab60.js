"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[3520],{3905:(e,n,t)=>{t.d(n,{Zo:()=>c,kt:()=>d});var r=t(7294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=r.createContext({}),p=function(e){var n=r.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},c=function(e){var n=p(e.components);return r.createElement(l.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},f=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),f=p(t),d=a,_=f["".concat(l,".").concat(d)]||f[d]||u[d]||o;return t?r.createElement(_,i(i({ref:n},c),{},{components:t})):r.createElement(_,i({ref:n},c))}));function d(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var o=t.length,i=new Array(o);i[0]=f;var s={};for(var l in n)hasOwnProperty.call(n,l)&&(s[l]=n[l]);s.originalType=e,s.mdxType="string"==typeof e?e:a,i[1]=s;for(var p=2;p<o;p++)i[p]=t[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}f.displayName="MDXCreateElement"},2687:(e,n,t)=>{t.r(n),t.d(n,{frontMatter:()=>s,contentTitle:()=>l,metadata:()=>p,toc:()=>c,default:()=>f});var r=t(7462),a=t(3366),o=(t(7294),t(3905)),i=["components"],s={id:"configuration_defaults",title:"Configuration default values"},l=void 0,p={unversionedId:"config/configuration_defaults",id:"config/configuration_defaults",isDocsHomePage:!1,title:"Configuration default values",description:"",source:"@site/docs/config/config-defaults.md",sourceDirName:"config",slug:"/config/configuration_defaults",permalink:"/pvm/docs/config/configuration_defaults",tags:[],version:"current",frontMatter:{id:"configuration_defaults",title:"Configuration default values"}},c=[],u={toc:c};function f(e){var n=e.components,t=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,r.Z)({},u,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import type { ConfigSchema } from '@pvm/types'\n\nexport const defaultConfig: ConfigSchema = {\n  versioning: {\n    unified: false,\n    unified_versions_for: [],\n    independent_packages: [],\n    source: 'package',\n    source_file: 'versions.json',\n  },\n  tagging: {\n    release_tag_package: '',\n    annotation_lookup_depth: 30,\n    suffixes: require.resolve('@pvm/suffixes'),\n    generic_tag: {\n      prefix: 'release',\n      date_format: 'yyyy.MM.dd',\n    },\n    for_packages: {\n      enabled: false,\n      as_release: false,\n      strip_namespace: true,\n    },\n  },\n  pkgset: {\n    ignore_files: [],\n    affected_files: [\n      {\n        if_changed: [],\n        then_affected: [],\n      },\n    ],\n  },\n  release: {\n    ensure_branch_up_to_date: true,\n    tag_only: false,\n  },\n  update: {\n    default_release_type: 'minor',\n    include_root: 'auto',\n    include_uncommited: false,\n    update_dependants: true,\n    no_release_ref: false,\n    dependants_release_type: 'patch',\n    hints_file: 'update-hints.toml',\n    workspace_release_files: true,\n    autolint: true,\n    respect_zero_major_version: false,\n    commit_via_platform: true,\n    push_remote: '',\n    retry_via_platform_if_failed_via_vcs: true,\n    release_type_overrides: [],\n    graph: {\n      title: 'Packages about to update',\n      strip_namespace: true,\n    },\n  },\n  core: {\n    deps_keys: [\n      'dependencies',\n      'devDependencies',\n      'peerDependencies',\n      'optionalDependencies',\n    ],\n  },\n  release_list: {\n    enabled: false,\n    path: 'releaseList.json',\n    limit: {\n      type: 'time',\n      value: '2 years',\n    },\n    storage: {\n      type: 'repo',\n    },\n  },\n  changelog: {\n    enabled: true,\n    path: 'changelog.md',\n    storage: {\n      type: 'repo',\n    },\n    skip_empty: false,\n    renderer: {\n      type: 'builtin.list',\n      tag_head_level: 2,\n      show_date: true,\n    },\n    front_matter: '',\n    for_packages: {\n      enabled: false,\n      output_dir: 'changelogs',\n      skip_empty: false,\n      renderer: {\n        type: 'builtin.list',\n        tag_head_level: 2,\n        show_date: true,\n      },\n      front_matter: '',\n    },\n  },\n  vcs: {\n    builtin_type: 'auto',\n  },\n  git: {\n    push: {\n      try_load_ssh_keys: false,\n      default_branch: 'master',\n    },\n  },\n  mark_pr: {\n    analyze_update: false,\n    packages_table: true,\n    attach_changelog: true,\n    packages_as_labels: false,\n    packages_graph: false,\n    renderer: {\n      type: 'builtin.list',\n      tag_head_level: 2,\n      show_date: true,\n    },\n  },\n  publish: {\n    cli_args: '--unsafe-perm',\n    disabled_for: [],\n    enabled_only_for: [],\n    process_npm_token: true,\n    include_monorepo_root: false,\n  },\n  plugins: {\n    local_plugins: [],\n    options: {},\n  },\n  plugins_v2: [\n    { plugin: require.resolve('@pvm/plugin-common-plugins') },\n  ],\n  templating: {\n    use_short_names: false,\n    filters: {\n      cutList: {\n        maxLen: 4,\n      },\n    },\n    vars: {},\n  },\n  templates: {\n    'pkg-update-deps': 'Update {{ newDepKeys | join(\", \") }} {{ newDepKeys | enpl(\"dependencies\", \"dependency\", \"dependencies\") }}:\\n\\n{{ originReleaseNotes }}',\n    'release-commit': 'Release {{ packages.values() | toArray | join(\", \", \"name\") | shorten(64) }}\\n\\nFull list of updated packages:\\n{% for oldPkg, newPkg in packages -%}\\n  {{ newPkg.name }}@[{{oldPkg.version}} -> {{newPkg.version}}]{{ \"\" if loop.last else \", \" }}\\n{% endfor %}',\n    failed_vcs_push: 'PVM has failed to push a release commit.\\n{% if CI_PIPELINE_URL -%}\\nSee [pipeline]({{CI_PIPELINE_URL}}).\\n{% endif -%}\\n',\n  },\n  jira: {},\n  gitlab: {\n    default_url: 'https://gitlab.com',\n    api_prefix: '/api/v4',\n    authorization_type: 'bearer',\n  },\n  github: {\n    auth_strategy: undefined,\n  },\n  dangerously_opts: {},\n  notifications: {\n    target: 'first_available',\n    clients: [],\n    clients_common_config: {},\n    client_configs: {},\n  },\n}\n\n")))}f.isMDXComponent=!0}}]);