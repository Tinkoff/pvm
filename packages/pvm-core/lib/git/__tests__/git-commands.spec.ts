import { getTagAnnotation } from '../commands'
import packages600 from './600-packages.json'

describe('git-commands', () => {
  it('git annotation should handle big text', async () => {
    const annotation = `big release\n\n---\n${packages600.join('\n')}`

    // @ts-ignore
    const repoPath = writeRepo({ name: 'bigann', spec: 'src/a@1.0.0' })
    // @ts-ignore
    const repo = await initRepo(repoPath)

    await repo.annotatedTag('v1.2.0', annotation)

    const extractedAnnotation = getTagAnnotation(repo.cwd, 'v1.2.0')
    expect(extractedAnnotation).toEqual(annotation)
  })
})
