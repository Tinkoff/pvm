import getEnv from '../env'

const template = `\
{%- macro showPkg(pkg) -%}
  *{{pkg.name}}@{{pkg.version}}*
{%- endmacro -%}
{{ success | items(0) | cutList("{restLen} more") | map(showPkg) | putCutMessage | joinAnd }}{{ " " }}
{{- success | enpl("all packages failed to release :(", "package has been released", "packages have been released") }}
{% for commit in commits | cutList("...") | putCutMessage -%}
  • {{ commit | stripServiceLabels | jiraLinkify }}
{% endfor -%}`

describe('templates', () => {
  it('шаблонизация списков через cut', async () => {
    const env = await getEnv()

    const ctx = {
      success: [
        [
          {
            name: 'test-a',
            version: '1.0.0',
          },
          '0.9.0',
        ],
        [
          {
            name: 'test-b',
            version: '2.0.0',
          },
          '1.3.0',
        ],
      ],
      commits: [
        'PFP-2321 Баг с получением полей структуры',
        'fix: коррекция наводки',
        'Добавлены валидаторы на максимальное кол-во символов для полей: `1`, `2`',
      ],
    }

    const result = env.renderString(template, ctx)

    expect(result).toMatchSnapshot()
  })

  it('шаблонизация списков через cut, 1 пакет', async () => {
    const env = await getEnv()

    const ctx = {
      success: [
        [
          {
            name: 'test-a',
            version: '1.0.0',
          },
          '0.9.0',
        ],
      ],
      commits: [
        'PFP-2321 Баг с получением полей структуры',
        'fix: коррекция наводки',
        'Добавлены валидаторы на максимальное кол-во символов для полей: `1`, `2`',
      ],
    }

    const result = env.renderString(template, ctx)

    expect(result).toMatchSnapshot()
  })
})
