# Release Stages

Генерация ReleaseData и ченжлогов на основе них.

## Контексты исполнения

1. Генерация с определенного релиза(t): ReleaseData формируется на основе релизных тегов
2. При релизе(u): ReleaseData формируется на основе ReleaseContext

## Зоны ответственности

### Update

1. Запись ReleaseData при релизе

### Releases

1. Выкачка артефактов
1. Формирование ReleaseData на основе релизных тегов (настоящих или будущих)
1. Работа с ReleaseList
1. Ротация списка релизов
1. Закачка артефактов

## Уровни абстракций

### Releases

1. Работа с working tree и извлечение релизов на основе него (WT -> RL)
1. Работа с active RL
1. Работа со список RL, ротация релизов


## Workflows

### 00u. Generate ReleaseContext:

```typescript
interface ReleaseContext {
  name: string,
  tagAnnotation: string,
  releaseTag: string,
  releaseNotes: string,
  updateState: UpdateStateInContext,
}
```

### 00t: Make ReleaseData from tags:

R1, R2 -> ReleaseData

### 01. Attributioin pipeline


```
releaseData = vcs.plPipe('releaseData', releaseData, {
  prevRelease,
})
```

#### 01.1u: Write To FS

```
if (outputReleaseData ?) {
  fs.writeFile('releaseData.json', releaseData)
}
```


### 02. Download Artifacts

