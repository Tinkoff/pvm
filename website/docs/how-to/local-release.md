---
id: local-releases
title: Релиз с локальной машины
---

Для публикации предварительно нужно выполнить следующие условия:
- Иметь доступ на публикацию в npm
- Иметь доступ на пуш в основную ветку (если в конфигурации не включен флаг `release.tag_only`)


Далее нужно пройти следующие шаги:
1. Предварительно собрать публикуемые пакеты командой, аналогично как собираются
пакеты перед публикацией в пайплайне.
2. Локально создать релизный тег или коммит (в зависимости от конфигурации):
   1. Выполнить команду `yarn pvm local update`
3. Убедиться, что будет опубликовано то, что планировалось:
   1. Выполнить команду `yarn pvm publish --dry-run`
4. Провести публикацию в npm registry:
   1. Выполнить `npm_config__auth=[токен авторизации в npm] yarn pvm publish`
5. Сохранить релизный тег и коммит:
   1. Если в конфигурации не включен флаг `release.tag_only`, то нужно запушить результирующие изменения в удаленный репозиторий командой `git push`
   2. Запушить релизный тег командой `git push --tags`
6. Сохранить артефакты публикации:
   1. Если в конфигурации заданы `release_list.enabled = true` и `release_list.storage.type === 'branch'`, то выполнить `yarn pvm artifacts upload release-list` 
   2. Если в конфигурации заданы `changelogs.enabled = true` и `changelogs.storage.type === 'branch'`, то выполнить `yarn pvm artifacts upload changelogs` 
