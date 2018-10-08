import chalk from 'chalk'

export function describeStrategy(strategyFn, display, description): void {
  strategyFn.description = chalk`{whiteBright ${display}}
    ${description}`
}
