# Usage

    import {unified} from 'unified'
    import cliInline from '@pvm/cli-inline-remark-plugin'

    main()

    async function main() {
      const file = await unified()
        .use(cliInline)
        .process('# Hello, Neptune!')

      console.log(String(file))
    }

For more details check the [usage guide](https://github.com/remarkjs/remark) for `remark`

## Example

String `@cli-inline npm -v` will be replaced with `npm -v` output

```
8.10.0

```
