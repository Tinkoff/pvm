import { shell } from '../lib/shell'

describe('pvm-core/shell', () => {
  it('should throw error with exit code saved to status field if command failed', async () => {
    let shellError: any
    try {
      shell('exit 2')
    } catch (e) {
      shellError = e
    }
    expect(shellError).toBeDefined()
    expect(shellError.status).toEqual(2)
  })
})
