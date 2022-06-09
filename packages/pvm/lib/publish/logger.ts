import type { Logger } from '@pvm/core/lib/logger'
import { loggerFor } from '@pvm/core/lib/logger'
import stream from 'stream'

export const logger: Logger = loggerFor('pvm:publish')

function bufferedStream(): stream.PassThrough {
  return new stream.PassThrough()
}

export function createBufferedLogger(): { bufferedLogger: typeof logger, loggerStream: NodeJS.WriteStream } {
  const loggerStream: NodeJS.WriteStream = bufferedStream() as unknown as NodeJS.WriteStream
  const bufferedLogger = logger.clone({
    stream: loggerStream,
  })

  return {
    loggerStream,
    bufferedLogger,
  }
}

export function printBufferedLogger(loggerStream: NodeJS.WriteStream): void {
  let chunk
  // eslint-disable-next-line no-cond-assign
  while (chunk = loggerStream.read()) {
    process.stderr.write(chunk)
  }
  loggerStream.end()
}
