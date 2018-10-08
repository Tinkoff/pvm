---
id: gitlab
title: Интеграция в гитлабе
---

Для внедрения мы сделаем:

* Установим зависимости
* Сконфигурируем package.json
* Сконфигурируем pvm
* Настроим .gitlab-ci.yml
* Добавим env переменные для CI


## Установка зависимостей

Для начала нужно [установить pvm](../get-started/installation.md),
также учесть момент с использованием [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) на этом этапе.

## Конфигурирование package.json

Pvm использует формат [yarn workspaces](https://yarnpkg.com/lang/ru/docs/workspaces/) для определения списка пакетов с которыми он будет работать.

Пример:

```json
{
  "name": "test-mono-repo",
  "workspaces": {
    "packages": [
      "packages/*"
    ]
  }
}
```

Здесь мы указали, что в нашей монорепе пакеты расположены в директории `packages`.

## Конфигурация pvm

Теперь нам нужно сконфигурировать pvm, для этого в корне репозитория создаем файл `.pvm.toml`, в котором мы будем указывать кастомные параметры нашего проекта.

```toml
[update]
dependants_release_type = 'as-dep'

# Конфигурация slack нотификаций при релизах библиотек
[slack_notification]
channel = '#temp'
username = 'Release bot'
icon_emoji = ':ghost:'
```

Помимо прочего мы здесь задали опцию `dependants_release_type` и теперь у нас при изменении пакетов, все пакеты, которые зависели от первых, будут наследовать тип релиза.
По умолчанию зависимые пакеты имеют тип релиза `patch`.

Полное описание всех дефолтных параметров, можно найти в файлах [pvm-defaults.ts](https://github.com/Tinkoff/pvm/blob/master/packages/pvm-core/pvm-defaults.ts) и [config-schema.ts](https://tinkoff.github.io/pvm/typedoc/interfaces/pvm_core.ConfigSchema.html).

## Конфигурация .gitlab-ci.yml

Мы будем запускать pvm в CI и при каждом мердже в master будет делать автоматический релиз библиотек, которые изменились.

В данном случае мы реализуем [flow с релизным коммитом](./usage.md#flow-with-release-commit), про который мы говорили в предыдущей части главы.

Напомню что выглядит он так: мы мержим новые коммиты в master, отрабатывает Pipeline, который определяет какие пакеты обновились и делает новый релизный коммит c тегом.
Дальше на этот релизный тег тригерится команда публикации и артефакты заливаются в npm.

Пример конфигурации:

```yaml
image: node:14.15.0

stages:
  - install
  - update
  - test
  - publish

# Добавляем для MR лейблы и комментарии с графом зависимостей и ченджлогом
mark merge request:
  stage: update
  interruptible: true
  except:
    - master
    - tags
  script:
    - yarn pvm mark-pr

# Создаем релизный коммит с измененными зависимостями
update:
  stage: update
  only:
    - master
  except:
    refs:
      - tags
    variables:
      - $CI_COMMIT_MESSAGE =~ /^Release/i
  script:
    - yarn pvm update

# Тригерется на релизные коммиты и заливает данные в npm
publish npm:
  stage: publish
  only:
    refs: 
      - /^release-/
      - /^v\d+\.\d+\.\d+/
  except:
    - branches
  script:
    # паблишит только те пакеты, версии которых были обновлены
    # в последнем релизном коммите
    - yarn pvm publish

# Команда "на всякий случай",
# которая позволяет синхронизировать данные между репозиторием и npm
manual republish:
  stage: publish
  only:
    - master
  when: manual
  script:
    - yarn pvm publish -s stale

# проверка корректности версий в пакетах
# в целом команда не обязательна
lint:
  stage: test
  except:
    - master
    - tags
  script:
    - yarn pvm lint
```

## ENV переменные в CI

Для работы PVM мы должны объявить ENV переменные в CI

* `GL_TOKEN` или `GITLAB_TOKEN` - токен gitlab, с помощью него pvm создает коммиты и получает данные из репозитория.
  [Инструкция по созданию токена](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#creating-a-personal-access-token) для своего пользователя.

### Опциональные переменные

* `npm_config__auth` и другие env переменные для npm – можно указать если вы используете простую авторизацию в npm.
* `GIT_SSH_PRIV_KEY` – обязательна в случае использования гитлаба и если выставлена настройка `update.commit_via_platform` в `false`.
   Подробнее про настройку можно почитать [здесь](../../how-to/gitlab-ssh-push.md).
* `SLACK_TOKEN` или `SLACK_WEBHOOK_URL` (deprecated) – токен или урл для слак-нотификаций, при необходимости.
  Также поддерживаются переменные с тем же именем, но префиксом `PVM_`. Лучше использовать токен, вебхуки слака это deprecated решение.

## Итоги

Это законченный, и даже местами избыточный пример того, как можно реализовать версионирование и доставку пакетов через CI/CD гитлаба. 