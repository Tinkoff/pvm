module.exports = {
  'book': {
    'I. Введение': [
      'book/get-started/overview',
      'book/get-started/functionality',
      'book/get-started/installation',
      'book/get-started/getting-help',
    ],
    'II. Версионирование': [
      'book/versioning/storing-versions',
      'book/versioning/unified-versions',
      'book/versioning/version-placeholders',
      'book/versioning/summary',
    ],
    'III. Релизный тег': [
      'book/release-tag/release-name',
      'book/release-tag/release-notes',
      'book/release-tag/summary',
    ],
    'IV. Автоматизация': [
      'book/cicd/usage',
      'book/cicd/gitlab',
    ],
    'Обновление пакетов (WIP)': [
      'book/updating/updating-process',

    ],
    'Справочник': [
      'book/glossary',
    ],
  },
  'Configuration': [
    'config/configuration',
    'api/interfaces/pvm_types.Env',
  ],
  'Справочник': {
    'How To': [
      'how-to/gitlab-ssh-push',
      'how-to/move-to-dedicated-versions',
      'how-to/reviewers',
      'how-to/local-releases',
      'how-to/update-hints',
    ],
    'Troubleshooting': [
      'troubleshooting/eneedauth',
    ],
  },
  'API': [
    {
      type: 'autogenerated',
      dirName: 'api/modules', // 'api' is the 'out' directory
    },
  ],
  'Architecture': {
    'C4': [
      'arch/c4/context',
      'arch/c4/components',
    ],
    'Releases': [
      'arch/releases/changelogs',
    ],
  },
}
