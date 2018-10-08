# @pvm/plugin-conventional-semantic-release

Плагин дополняет другой плагин `@pvm/plugin-conventional-changelog` логикой
расчета типа релиза по логике `@semantic-release/commit-analyzer`

[Правила](https://github.com/semantic-release/commit-analyzer/blob/master/lib/default-release-rules.js) по-умолчанию применяемые в `commit-analyzer`
```js
/**
 * Default `releaseRules` rules for common commit formats, following conventions.
 *
 * @type {Array}
 */
module.exports = [
  {breaking: true, release: 'major'},
  {revert: true, release: 'patch'},
  // Angular
  {type: 'feat', release: 'minor'},
  {type: 'fix', release: 'patch'},
  {type: 'perf', release: 'patch'},
  // Atom
  {emoji: ':racehorse:', release: 'patch'},
  {emoji: ':bug:', release: 'patch'},
  {emoji: ':penguin:', release: 'patch'},
  {emoji: ':apple:', release: 'patch'},
  {emoji: ':checkered_flag:', release: 'patch'},
  // Ember
  {tag: 'BUGFIX', release: 'patch'},
  {tag: 'FEATURE', release: 'minor'},
  {tag: 'SECURITY', release: 'patch'},
  // ESLint
  {tag: 'Breaking', release: 'major'},
  {tag: 'Fix', release: 'patch'},
  {tag: 'Update', release: 'minor'},
  {tag: 'New', release: 'minor'},
  // Express
  {component: 'perf', release: 'patch'},
  {component: 'deps', release: 'patch'},
  // JSHint
  {type: 'FEAT', release: 'minor'},
  {type: 'FIX', release: 'patch'},
];
```

## Параметры

### `releaseRules`

Идентично [аналогичной](https://github.com/semantic-release/commit-analyzer#releaserules) настройке в `@semantic-release/commit-analyzer` и
позволяет добавить свои правила для релизов. Сперва будут проверяться пользовательские правила и, если подходяещго
правила там найдено не будет, то будут применены правила по-умолчанию.

## Отличия от работы плагина `@pvm/plugin-conventional-changelog` по-умолчанию
По логике `semantic-release` если подходящего правила не будет найдено в правилах по-умолчанию и в пользовательских правилах, то
тип релиза будет установлен в `none` и релиз этот коммит создавать не будет (если в списке будут другие коммиты, то тип релиза будет определяться ими).

В этом отличие логики расчета
типа релиза в `conventional-changelog-angular`, где коммит, не подходящий под правила, будет триггерить релиз типа `patch`.
