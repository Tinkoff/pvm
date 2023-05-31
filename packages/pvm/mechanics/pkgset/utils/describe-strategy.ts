import chalk from 'chalk'

export function describeStrategy(strategyFn: any, display: string, description: string): void {
  strategyFn.description = chalk`{whiteBright ${display}}
    ${description}`
}
