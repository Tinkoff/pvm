---
id: functionality
title: Поддерживаемый функционал
---

### Общий
1. Автоматическое поднятие версии пакета, ее сохранение и публикация с новой версией
2. [Оповещение](api/modules/pvm_notifications.md) о результате публикации
3. Генерация [чейнджлога](api/interfaces/pvm_core.Config.md#changelog) и его сохранение
4. [Возможность](api/interfaces/pvm_core.Config.md#versioning) сохранения версии без дополнительного коммита в репозиторий
5. Возможность задать [альтернативный путь](api/interfaces/pvm_core.Config.md#publish) до публикуемого пакета
6. Поддержка разных схем расчета версий ([semantic-release](api/modules/pvm_plugin_conventional_semantic_release.md), [conventional-commit](api/modules/pvm_plugin_conventional_changelog.md))
9. Расширяемость посредством плагинов
10. Предварительный вывод результата будущих изменений для оценки правильности через поддержку флага `--dry-run` большинством команд
11. Возможность локального выполнения команд без записи во внешние сервисы через команды `pvm local <command>` (список команд - `yarn pvm local --help`)
12. Интеграция с платформами хранения кода ([gitlab](api/modules/pvm_gitlab.md), [github](api/modules/pvm_github.md))

### Монорепозиторий
1. Обновление измененных пакетов, [учитывая зависимости](api/interfaces/pvm_core.Config.md#update) между ними
2. Гарантия синхронизации версий в зависимостях пакетов монорепы
3. Возможность задать [единую версию](../versioning/version-placeholders.md) пакетов для части или всех пакетов в репозитории
4. [Отключение публикации](api/interfaces/pvm_core.Config.md#publish) для части пакетов
5. Возможность ручного переопределения типа релиза (major, minor, patch, none) для одного или группы пакетов
6. Поддержка генерации [индивидуальных чейнджлогов](api/interfaces/pvm_core.Config.md#changelog) на каждый пакет