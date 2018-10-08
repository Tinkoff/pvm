---
id: filter_files
title: Фильтрация файлов в проекте
---

## CLI
`yarn pvm-files -f <паттерны фильтрации файлов> -a <выводить абсолютные пути> -s <стратегия выборки пакетов> -S <опции для стратегии>`
Подробное описание параметров нужно смотреть в хелпе команды - `yarn pvm-files -h`

### Паттерны фильтрации
Один (`-f **/*.stories.js`) или несколько (`-f blocks/**/*.stories -f test/*.stories.js`) паттернов
по которым будет делаться фильтрация в выбранных пакетах.
 
**Важно** 
Когда применяется фильтр по файлам пакеты уже выбраны, т.е. последовательность конвейра такая
`поискПакетов(выбранная_стратегия, конфиг_pvm) -> поискФайловВПакетах(списков_пакетов)`

### Стратегия выбора пакетов

#### `changed`
Непосредственно измененные пакеты

#### `affected`
Измененные пакеты, зависимые от измененных и `всегда измененные` пакеты.
Стратегия настраивается конфигами `pkgset.affected_files` и `dangerously_opts.always_changed_workspaces`.

Пример `.pvm.toml`
```
[dangerously_opts]
always_changed_workspaces = [
  'src/blocks/test-*',
]

[[pkgset.affected_files]]
if_changed = ['booky/*.{js,jsx,ts,tsx}', '.storybook/**/*']
then_affected = ['src/{blocks,atoms,tests,demos}/**/__stories__/*.stories.{js,jsx,ts,tsx}']

[[pkgset.affected_files]]
if_changed = ['codeceptjs/*.{js,jsx,ts,tsx}']
then_affected = ['src/{blocks,atoms,tests,demos}/**/__acceptance__/**/*.test.{js,jsx,ts,tsx}']
```

#### `released`
Пакеты, опубликованные между текущим, и последним релизами

#### `stale`
Пакеты, версия которых в мастер-ветке репозитория отличается от опубликованной

#### `stdin`
Список пакетов передается через `stdin`

## Node Api
Пример работы с Node Api.
```ts
import getFiles from '@pvm/files'

async function main() {
    const files = await getFiles('**/*.stories.js', {
        absolute: false,
        strategy: 'affected',
        includeUncommited: true,
    })

    console.log(files) // ['pkgs/a/a.stories.js']    
}

main()
    .catch((e) => {
        process.exitCode = 1
        console.error(e)    
    }) 
```