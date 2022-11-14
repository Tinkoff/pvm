---
id: index
title: Change Log
---

## v0.56.15
**2022.11.14**



### 🐛 Bug Fixes

* **@pvm/core:** revParse optimization ([#f1e4430](https://github.com/Tinkoff/pvm/commit/f1e4430318e3c9506f6ec8600185ec8642ff5c0c))
* concurrency in perf-test job ([#ede99ae](https://github.com/Tinkoff/pvm/commit/ede99aee022e779812c5d35b35dccdb76c78acf5))


### 📝 Documentation

* correct ref link in perf test resport ([#000c441](https://github.com/Tinkoff/pvm/commit/000c441cfc1a3bbadbac3dba9320903e08e6f086))
* try fix permissions issue ([#bdfad68](https://github.com/Tinkoff/pvm/commit/bdfad68884d16e8e2d3444d6c4f07483d8b19f3c))




## v0.56.14
**2022.11.14**



### 🐛 Bug Fixes

* add total perf metrics ([#0d800c3](https://github.com/Tinkoff/pvm/commit/0d800c3170c9a20dc916591b67a4936453d8657b))




## v0.56.13
**2022.10.31**



### 🐛 Bug Fixes

* **@pvm/plugin-core:** partially failed publish now throws error ([#d59ec04](https://github.com/Tinkoff/pvm/commit/d59ec047cc39f3c0361dff3a14ae17de63731d89)), closes [    21](https://github.com/Tinkoff/pvm/issues/21)




## v0.56.12
**2022.10.28**



### 🐛 Bug Fixes

* remove deprecated unused config options ([#44b9155](https://github.com/Tinkoff/pvm/commit/44b9155f922b423fe2d888566a744174fcdb51dd))




## v0.56.11
**2022.10.28**



### 🐛 Bug Fixes

* add locators support for publish config ([#71d0a9e](https://github.com/Tinkoff/pvm/commit/71d0a9e2fd8b5004e67f33db07ae1eb8c8520b0f)), closes [    35](https://github.com/Tinkoff/pvm/issues/35)


### Other

* Remove slack notifications ([#b735750](https://github.com/Tinkoff/pvm/commit/b735750d0b68dc94850e041b7ed7e368da7c13aa))




## v0.56.10
**2022.10.28**



### 🐛 Bug Fixes

* yarn v1 npm commands call fix ([#3fd7819](https://github.com/Tinkoff/pvm/commit/3fd7819ffe3196f484704498785d9e1ea305cc3a)), closes [    58](https://github.com/Tinkoff/pvm/issues/58)




## v0.56.9
**2022.10.28**



### ↩️ Reverts

* Revert "chore: filter private pkgs from published list" ([#c27bbc4](https://github.com/Tinkoff/pvm/commit/c27bbc4f62eb5e432723745d594df280b2e4b9f2))


### Other

* publish artifacts to website ([#3e9b761](https://github.com/Tinkoff/pvm/commit/3e9b761c602345427e0474ebf3f45dbffd0e0983))




## v0.56.8
**2022.10.27**



### 🐛 Bug Fixes

* **@pvm/core:** resolve providers against config file dir ([#39d7711](https://github.com/Tinkoff/pvm/commit/39d7711c7be3659449e461136c66491e460435d6))




## v0.56.7
**2022.10.27**



### 🐛 Bug Fixes

* **@pvm/plugin-core:** remove exports restrictions ([#426b088](https://github.com/Tinkoff/pvm/commit/426b088502521d5ad87b6ac707fe72c894ab385b))




## v0.56.6
**2022.10.27**



### 🐛 Bug Fixes

* **@pvm/core:** add backward imports ([#1a14287](https://github.com/Tinkoff/pvm/commit/1a142871b93d1ebee2b33e594a67bd8273519b7a))
* **@pvm/core:** add missing package ([#9f263cf](https://github.com/Tinkoff/pvm/commit/9f263cfeb8d538a346fb6e6a1e43e31d6a6ccb2c))




## v0.56.5
**2022.10.26**



### 🐛 Bug Fixes

* **@pvm/core:** fix plugin resolution paths ([#459ecda](https://github.com/Tinkoff/pvm/commit/459ecda402cbf771d01fdbc355561f2e07ee5f95))




## v0.56.4
**2022.10.25**



### 🐛 Bug Fixes

* **@pvm/gitlab:** move plugin to @pvm/gitlab to preserve backward compatibility ([#1d4487b](https://github.com/Tinkoff/pvm/commit/1d4487bf4c4ce88357ab05d5a065e1080369af67))




## v0.56.3
**2022.10.25**



### 🐛 Bug Fixes

* **@pvm/core:** plugins and plugins_v2 load compat ([#0e8f765](https://github.com/Tinkoff/pvm/commit/0e8f7652bf1178571b23b7b7fcad0d57b73ec332))




## v0.56.2
**2022.10.24**



### 🐛 Bug Fixes

* **@pvm/core:** plugins init corrected ([51](https://github.com/Tinkoff/pvm/issues/51)) ([#8f13cba](https://github.com/Tinkoff/pvm/commit/8f13cba5a2056e1577fc13074643ab84a4878b07))




## v0.56.1
**2022.10.17**



### 🐛 Bug Fixes

* move cli to di extensions ([50](https://github.com/Tinkoff/pvm/issues/50)) ([#09011a4](https://github.com/Tinkoff/pvm/commit/09011a4fcdc272610f692c95d226e53589c49dfa))




## v0.56.0
**2022.10.13**



### 🚀 Features

* single entrypoint implementation first step ([49](https://github.com/Tinkoff/pvm/issues/49)) ([#f85d0b9](https://github.com/Tinkoff/pvm/commit/f85d0b9fa54b0726d1b8dafa181cba633a219d5f))




## v0.55.27
**2022.09.23**



### 🐛 Bug Fixes

* **@pvm/update:** update_dependants now matches by pkg path ([#1d142f7](https://github.com/Tinkoff/pvm/commit/1d142f7d957c8a8cc1bf98f2e45fbbbecf7be9e7))




## v0.55.26
**2022.09.21**



### 🐛 Bug Fixes

* correct publish version calculation for unified versioning and publish.path_mapping ([#a0fc5b4](https://github.com/Tinkoff/pvm/commit/a0fc5b4ce8b81f3a366a27467ff5cce920720a66))




## v0.55.25
**2022.09.19**



### 🐛 Bug Fixes

* **@pvm/update:** fix 'none' release-type for dependants ([#9c421b3](https://github.com/Tinkoff/pvm/commit/9c421b3b2143bcafa96f9700b36159aaedb98ba4))




## v0.55.24
**2022.09.15**



### 🐛 Bug Fixes

* **@pvm/vcs:** fix local mode need of platform api ([#7cc1ced](https://github.com/Tinkoff/pvm/commit/7cc1ced53f3913bb43457cbb4b969e16af2bdec9))




## v0.55.23
**2022.09.09**



### 🐛 Bug Fixes

* **@pvm/pvm:** fix publish with yarn v1 scripts on node 16 with npm 8+ ([#559e52b](https://github.com/Tinkoff/pvm/commit/559e52ba6ad08f3ee02810134524d6e3fd468944))




## v0.55.22
**2022.09.07**



### 🐛 Bug Fixes

* **@pvm/core:** call node-boot on getConfig call ([#dca0526](https://github.com/Tinkoff/pvm/commit/dca05264dd35c005fd699babc9bb28bd86c20275))




## v0.55.21
**2022.09.06**



### 🐛 Bug Fixes

* **@pvm/core:** add granular configuration for updated dependants set ([#438f019](https://github.com/Tinkoff/pvm/commit/438f019ce7b8fc825942df31f9faa9cf699df302))




## v0.55.20
**2022.08.18**



### 🐛 Bug Fixes

* add support for non-"git root" cwd ([#623672d](https://github.com/Tinkoff/pvm/commit/623672df35c167a66a3e7ab07216e6ae5eef1e92))


### Other

* test fix ([#7448d43](https://github.com/Tinkoff/pvm/commit/7448d439da366772916a5da33ee6e47c830b876c))




## v0.55.19
**2022.07.25**



### 🐛 Bug Fixes

* **@pvm/core:** resolve config against cwd and not git root dir ([#ec4620a](https://github.com/Tinkoff/pvm/commit/ec4620a6bac70b65d827f90ac7f0ac29780286df))


### 📝 Documentation

* fix links to sources from typedoc ([#16b69ac](https://github.com/Tinkoff/pvm/commit/16b69ac8cd0dedd583f14a610286c427534cf80e))




## v0.55.18
**2022.07.18**



### 🐛 Bug Fixes

* **@pvm/pvm:** allow publish monorepo root ([#0ee0a83](https://github.com/Tinkoff/pvm/commit/0ee0a83e4874ba3cdbac55b607b6964ab692dca1))




## v0.55.17
**2022.07.07**



### 🐛 Bug Fixes

* **@pvm/core:** add user-agent to request headers ([#394ddc3](https://github.com/Tinkoff/pvm/commit/394ddc395ecc5dcd7d23c20660f040c39aadff0d))


### Other

* correct token for pvm update call ([#659927e](https://github.com/Tinkoff/pvm/commit/659927e66693326d6ac4414fa80db53d82ed45dc))




## v0.55.16
**2022.06.23**



### 🐛 Bug Fixes

* **@pvm/types:** add empty readme ([#05b68af](https://github.com/Tinkoff/pvm/commit/05b68afc15f6eb0ee340aef57cf2ce95546dd3d9))


### Other

* pass env variables only to commands where they need ([#23744ec](https://github.com/Tinkoff/pvm/commit/23744ec3c752c0ceac15b2227abf5553d259396e))
* replace TINKOFF_PAT_TOKEN with GITHUB_TOKEN ([#04fcaac](https://github.com/Tinkoff/pvm/commit/04fcaac39419866bdc122afe31dec82f32ce60d2))




## v0.55.15
**2022.06.22**



### 🐛 Bug Fixes

* **@pvm/core:** allow config in json5 format ([#2a1c538](https://github.com/Tinkoff/pvm/commit/2a1c5382751c6e39c3d2970c68bf6be5b2643c90))


### Other

* filter private pkgs from published list ([#6a887a8](https://github.com/Tinkoff/pvm/commit/6a887a84620cef5242c845bd6880e6fcee7c285e))




## v0.55.14
**2022.06.17**



### Other

* Update update-hints.md ([#3289948](https://github.com/Tinkoff/pvm/commit/3289948d08ffa40595b1f2af7ce590da6320e42d))
* switch to npm v8 ([#6afd9d6](https://github.com/Tinkoff/pvm/commit/6afd9d69904930aeb11737f343d032e6346d5065))




## v0.55.13
**2022.06.14**



### 🐛 Bug Fixes

* correct labels setup in gitlab mr's ([#7b454c4](https://github.com/Tinkoff/pvm/commit/7b454c40d5c8435ed36ec520fc1e802fe764b9fc))




## v0.55.12
**2022.06.11**



### 🐛 Bug Fixes

* add ability to set and process update hints via merge request description in gitlab ([#05daa5c](https://github.com/Tinkoff/pvm/commit/05daa5c690f55845ec445cddb33533c64c5f2b14))




## v0.55.11
**2022.06.10**



### 🐛 Bug Fixes

* **@pvm/core:** add peerDependencies and optionalDependencies as default deps_keys ([#b5c4636](https://github.com/Tinkoff/pvm/commit/b5c4636541466f4c1d3337eaef29ba4439d68eb7))




## v0.55.10
**2022.06.10**



### 🐛 Bug Fixes

* **@pvm/git-vcs:** correct commit logic for windows environment ([#1e1b224](https://github.com/Tinkoff/pvm/commit/1e1b224d2618a88491e60e7b8fd1c0049785e2ff))


### Other

* notifications are sended to pvm-github channel ([#df0ac2d](https://github.com/Tinkoff/pvm/commit/df0ac2d9b6f79b8530ed30e11b0f8025696b8442))
* setup mattermost incoming webhook ([#3d9f5a9](https://github.com/Tinkoff/pvm/commit/3d9f5a9b4d68a4aee90435e480af367433000f7e))




## v0.55.9
**2022.06.06**



### 📝 Documentation

* translation and rearranging in doc site header ([#635a654](https://github.com/Tinkoff/pvm/commit/635a6548ff4e7f7aef9794a800bfcd4280ae5798))




## v0.55.8
**2022.06.06**



### 🐛 Bug Fixes

* **@pvm/mattermost:** send attachments via webhook too ([#7825cdd](https://github.com/Tinkoff/pvm/commit/7825cdd924924c7a5b81083318986b428413c45f))




## v0.55.7
**2022.06.03**



### 📝 Documentation

* **@pvm/plugin-http-proxy:** readme translated to english ([#380a1ef](https://github.com/Tinkoff/pvm/commit/380a1ef89ba3c5d16a54510b1ea07ec792fe8da6))




## v0.55.6
**2022.06.03**



### 📝 Documentation

* **@pvm/pvm:** readme translated to english ([#6f2c288](https://github.com/Tinkoff/pvm/commit/6f2c2888be76893e4ee054819c4049aec090c684))




## v0.55.5
**2022.06.03**



### 📝 Documentation

* **@pvm/slack:** readme translated to english ([#75ec3b1](https://github.com/Tinkoff/pvm/commit/75ec3b1db678111fbdf497cb4b310dd937f5b1cc))
* correct fetch depth for docs generation ([#a3b5737](https://github.com/Tinkoff/pvm/commit/a3b5737246c066f2cfde8d3bcf39a81f31891bca))
* correct fetch depth for docs generation on master ([#dad114d](https://github.com/Tinkoff/pvm/commit/dad114d49bc098dd7e65ec4954ec8a89fa438e29))
* use @pvm/pkgset to collect packages ([#c525d6d](https://github.com/Tinkoff/pvm/commit/c525d6db9e698dcbee72a9523f1e3b89ba4bdb9c))


### Other

* generate doc on release too ([#5f78e7a](https://github.com/Tinkoff/pvm/commit/5f78e7a87d9c3ddadac5188bd47c31cb4076556f))




## v0.55.4
**2022.06.03**



### 📝 Documentation

* **@pvm/add-tag:** translate readme to english ([#2a62428](https://github.com/Tinkoff/pvm/commit/2a62428e46265b8996092b4f701f074d68473aaa))
* store pkg tarballs in doc output ([#4de7e9d](https://github.com/Tinkoff/pvm/commit/4de7e9d4e5d0d64f9efc6611d4eaef93e922da36))


### Other

* remove `only` from test spec ([#0d12432](https://github.com/Tinkoff/pvm/commit/0d1243258be9222289aa9a7bbc8c24f873909b13))




## v0.55.3
**2022.06.02**



### 🐛 Bug Fixes

* **@pvm/mattermost:** incoming hooks now working without channel name ([#50f8341](https://github.com/Tinkoff/pvm/commit/50f8341f2240edd3a131ba7452dab44e1c88c30b))




## v0.55.2
**2022.06.02**



### 🐛 Bug Fixes

* **@pvm/mattermost:** add progressive retry on 408 response code ([#bfc7f49](https://github.com/Tinkoff/pvm/commit/bfc7f4948a6f1d7bfc93a23da95ba2ad7cc1c7c6))




## v0.55.1
**2022.06.01**



### 🐛 Bug Fixes

* **@pvm/mattermost:** incoming webhooks support added ([#b44fc0e](https://github.com/Tinkoff/pvm/commit/b44fc0ef9c099bf88e165e95ed50382486fb97cd))




## v0.55.0
**2022.05.27**



### 🚀 Features

* **@pvm/vcs:** make platform packages optional ([#a4210dc](https://github.com/Tinkoff/pvm/commit/a4210dca7376da5294aea521cdd9a14e38731fcc))




## v0.54.8
**2022.05.25**



### 📝 Documentation

* setup readme.md files compilation ([#e0fb9e6](https://github.com/Tinkoff/pvm/commit/e0fb9e6585930d2a6a365a0522bf71b94ea6e0ff))




## v0.54.7
**2022.05.25**



### 🐛 Bug Fixes

* initialize plugins in notificator factory ([#3f1bdc2](https://github.com/Tinkoff/pvm/commit/3f1bdc2dfa09b86ede19fb2376f4481f280a105e))
* pass cwd to since-last-release ([#82e5f2a](https://github.com/Tinkoff/pvm/commit/82e5f2a6de8fb318032c623b3c267adc8862d0d7))


### 📝 Documentation

* remove slack mentions from docs ([#295eefb](https://github.com/Tinkoff/pvm/commit/295eefb086da6493a4ca85ec23a742890b151967))


### 🧪 Tests

* fix unstable github and notificator tests ([#9c303ba](https://github.com/Tinkoff/pvm/commit/9c303ba18d352f61c9db62d0158c2a8117b93b08))




## v0.54.6
**2022.05.19**



### Other

* enable conventional changelog plugin ([#527421a](https://github.com/Tinkoff/pvm/commit/527421a9c4c05ce523eb5c0891fe5658a6a5f58e))




## v0.54.5
**2022.05.19**

chore: fetch more commits in release job

## v0.54.4
**2022.05.19**

chore: set `--access public` for publication

## v0.54.3
**2022.05.19**

chore: fix npm registry authentication

## v0.54.2
**2022.05.19**

- chore: turn on publication to registry
- docs: remove migration to 0.53.0 guide
- docs: remove instructions for internal usage
- docs: move docs generation to master merge workflow
- docs: setup docs autodeploy

## v0.54.1
**2022.04.29**

correct mattermost support and add more docs

