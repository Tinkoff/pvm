# @pvm/plugin-conventional-changelog

Пресет для библиотеки conventional-changelog, наследует опции из пресета [conventional-changelog-angular](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular)

## Мотивация
Пресет `conventional-changelog-angular` игнорирует коммиты всех типов, кроме `feat`, `fix` и `perf` (не считая коммитов 
с пометкой breaking change). Из-за этого, при частых релизах с исправлениями документации или тестов, ченджлоги содержат
много пустых описаний релизов. Также, шаблон `header.hbs` из `conventional-changelog-angular` создает бесполезный заголовок
с версией из корневого package.json монорепозитория, к каждому релизу. Шаблон `commit.hbs` не проверяет наличие свойств 
`hash` и `shortHash` у коммитов, и генерирует битые ссылки на коммиты.

## Типы релизов и версии
1. Тип релиза определяется через коммиты
   1. Тип релиза определяется по коммитам согласно semver соглашениям conventional-commits:
      > fix type commits should be translated to PATCH releases. feat type commits should be translated to MINOR releases. Commits with BREAKING CHANGE in the commits, regardless of type, should be translated to MAJOR releases.
      
      Также замечу что текст **BREAKING CHANGE** нужно вставлять именно в теле коммита, что иногда вызывает сложности, поэтому см. ниже упрощенный способ, доступный в pvm.
   2. Мажорные релизы можно делать через восклицательный знак после типа и скопа коммита: `feat(scope)!: этот коммит будет мажорным` или `feat!: этот коммит будет мажорным`. Мажорное обновление получат все пакеты, которые в этом коммите были затронуты.
2. Версии хранятся [выделенно](book/versioning/version-placeholders.md), для того чтобы задать начальную версию для пакета используйте поле `initialVersion` в package.json пакета. В дальнейшем версия или версии для пакетов будут хранится в релизных тегах.

## Зависимость типа релиза от коммитов
| Коммит                                                                                             |Тип релиза|Группа в ченжлоге|
|:---------------------------------------------------------------------------------------------------|:------------|:---|
| Ворнинги для targetMethod вызовов                                                                  | patch |Other|
| feat(libs/logger): PFPCORE-1806 Ворнинги для targetMethod вызовов                                  |minor|🚀 Features|
| feat(libs/logger)!: PFPCORE-1806 Ворнинги для targetMethod вызовов                                 | major|🚀 Features|
| fix: Ворнинги для targetMethod вызовов                                                             | patch |🐛 Bug Fixes|
| feat: Ворнинги для targetMethod вызовов<br/><br/>BREAKING CHANGE описание несовместимого изменения |major|🚀 Features|


Итого:
* Major релиз задается через восклицательный знак или текста BREAKING CHANGE с дальнейшим описанием в теле коммита.
* Minor задается через тип коммита feat и только через него.
* Все остальные коммиты будут давать тип релиза patch.
* Коммит который не определяет свой тип(группу) или имеет неизвестный тип попадает в группу Other.
* [Регулярка](https://regex101.com/r/YOPO7s/1/) для заголовка коммитов

## Доступные типы(группы) коммитов
|Тип|Вывод в ченжлоге|
|:---|:---|
|feat|🚀 Features|
|fix|🐛 Bug Fixes|
|perf|🏃‍♀️ Performance Improvements|
|revert|↩️ Reverts|
|docs|📝 Documentation|
|style|💅 Styles|
|refactor|🛠️ Code Refactoring|
|test|🧪 Tests|
|build|🧰 Build System|
|ci|⚙️ Continuous Integration|
|<все остальные>|Other|