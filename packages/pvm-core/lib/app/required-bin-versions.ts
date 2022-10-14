import binaryVersionCheck from 'bin-version-check'

const REQUIRED_CMD = [
  ['git', '>= 2.11.0'],
]

export async function verifyRequiredBins(): Promise<void> {
  const errors: string[] = []

  for (const [cmd, versionRange] of REQUIRED_CMD) {
    try {
      await binaryVersionCheck(cmd, versionRange)
    } catch (error) {
      errors.push(error.message)
    }
  }

  if (errors.length) {
    throw new Error(errors.join('\n'))
  }
}
