---
id: index
title: Change Log
---

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

