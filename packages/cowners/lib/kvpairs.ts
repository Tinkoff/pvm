export type ValueType = boolean | string | number | null
export type KvPair = [string, ValueType]

const wsRe = /\s+/

interface ILexer {
  input: string,
  pos: number,
}

const eof = ''
class LexError extends Error {}

class Lexer implements ILexer {
  pos: number
  input: string

  constructor(input: string) {
    this.pos = 0
    this.input = input
  }

  isEof(): boolean {
    return this.pos >= this.input.length
  }

  peek(): string {
    return this.input.charAt(this.pos)
  }

  next(): string {
    if (this.isEof()) {
      return eof
    }
    return this.input.charAt(this.pos++)
  }

  last(): string {
    return this.input.charAt(this.pos - 1)
  }

  backup(): void {
    this.pos -= 1
  }

  eatUntil(stopChar: string): string {
    let ch
    let result = ''
    do {
      ch = this.next()
      if (ch === stopChar) {
        this.backup()
        break
      }
      result += ch
    } while (ch !== eof)
    return result
  }

  begin(): (msg: string | void) => never {
    const pos = this.pos

    return (message: string | void): never => {
      this.pos = pos
      const defaultMsg = this.isEof() ? 'unexpected end of input' : 'unexpected value'
      throw new LexError(message || defaultMsg)
    }
  }

  eatPairedValue(pairSymbol: string): string {
    let result = ''
    let wasEscape = false
    const cancel = this.begin()
    if (this.next() !== pairSymbol) {
      return cancel(`expected ${pairSymbol} got ${this.last()}`)
    }
    while (true) {
      const ch = this.next()
      if (ch === eof) {
        return cancel()
      }
      if (ch === `\\`) {
        wasEscape = true
        continue
      }
      if (!wasEscape && pairSymbol === ch) {
        break
      }
      result += ch

      wasEscape = false
    }

    return result
  }

  eatWs(): void {
    while (!this.isEof()) {
      if (!wsRe.test(this.next())) {
        this.backup()
        break
      }
    }
  }
}

function eatKey(l: Lexer): string {
  const noLuck = l.begin()
  const pos = l.pos
  const eqIndex = l.input.indexOf('=', pos)

  if (eqIndex !== -1) {
    l.pos = eqIndex + 1
    return l.input.substring(pos, eqIndex).trim()
  }
  return noLuck()
}

function parseValue(value: string): boolean | number | null | string {
  if (!value) {
    throw new LexError('unexpected empty input')
  } else if (value === 'true') {
    return true
  } else if (value === 'false') {
    return false
  } else if (value === 'null') {
    return null
  }
  const maybeNumber = parseInt(value)
  if (!isNaN(maybeNumber)) {
    return maybeNumber
  }
  return value
}

function eatValue(l: Lexer): ValueType {
  const ch = l.peek()
  if (ch === `'` || ch === '"') {
    return l.eatPairedValue(ch)
  }

  return parseValue(l.eatUntil(' '))
}

function eatPair(l: Lexer): KvPair {
  l.eatWs()
  const key = eatKey(l)
  l.eatWs()
  const value = eatValue(l)
  return [key, value]
}

function * parseKvPairs(input: string): IterableIterator<KvPair> {
  const lexer = new Lexer(input)
  lexer.eatWs()

  try {
    while (!lexer.isEof()) {
      yield eatPair(lexer)
    }
  } catch (e) {
    if (!(e instanceof LexError)) {
      throw e
    }
  }
}

export {
  parseKvPairs,
}
