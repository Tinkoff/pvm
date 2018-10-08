# @pvm/plugin-conventional-changelog

## preset

Пресет для библиотеки conventional-changelog, наследует опции из пресета [conventional-changelog-angular](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular)

### Мотивация

Пресет `conventional-changelog-angular` игнорирует коммиты всех типов, кроме `feat`, `fix` и `perf` (не считая коммитов 
с пометкой breaking change). Из-за этого, при частых релизах с исправлениями документации или тестов, ченджлоги содержат
много пустых описаний релизов. Также, шаблон `header.hbs` из `conventional-changelog-angular` создает бесполезный заголовок
с версией из корневого package.json монорепозитория, к каждому релизу. Шаблон `commit.hbs` не проверяет наличие свойств 
`hash` и `shortHash` у коммитов, и генерирует битые ссылки на коммиты.

### Принцип работы

Пресет `conventional-changelog-tramvai-preset` экспортирует все опции из `conventional-changelog-angular`, 
заменяя некоторые из них. Подключение нового пресета происходит в файле настроек для `pvm` - `.pvm.toml` в корне
репозитория, в качестве опции для `@pvm/plugin-conventional-changelog`: