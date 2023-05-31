import { createToken } from '@pvm/pvm'

export const GITLAB_AUTH_FUNCTION_TOKEN = createToken<() => Promise<string>>('GITLAB_AUTH_FUNCTION_TOKEN')
