const {
  GITLAB_USER_EMAIL = 'jest-agent@bot.service',
  GITLAB_USER_NAME = 'Jest Agent',
} = process.env

export function getGitConfigTools(gitShell: (cmd: string) => string) {
  return {
    getUserConfig() {
      let name
      try {
        name = gitShell(`git config user.name`)
      } catch (e) {}

      let email
      try {
        email = gitShell(`git config user.email`)
      } catch (e) {}

      return {
        name,
        email,
      }
    },

    setGitNameAndEmail() {
      gitShell(`git config user.email "${GITLAB_USER_EMAIL}"`)
      gitShell(`git config user.name "${GITLAB_USER_NAME}"`)
    },

    unsetGitNameAndEmail() {
      gitShell(`git config --unset user.email`)
      gitShell(`git config --unset user.name`)
    },

    async runInPreparedEnvironment(runner: () => any) {
      const { name, email } = this.getUserConfig()
      const shouldPrepareEnv = !name || !email

      // для команд pvm создаем окружение, максимально приближенное к боевому (для PVM-187 т.к. в CI не будет задано)
      if (shouldPrepareEnv) {
        this.setGitNameAndEmail()
      }
      const runResult = await runner()

      if (shouldPrepareEnv) {
        this.unsetGitNameAndEmail()
      }

      return runResult
    },

    async runInPureEnvironment(runner: () => any) {
      const { name, email } = this.getUserConfig()
      const shouldPurifyEnv = name || email

      // для команд pvm создаем окружение, максимально приближенное к боевому (для PVM-187 т.к. в CI не будет задано)
      if (shouldPurifyEnv) {
        this.unsetGitNameAndEmail()
      }
      const runResult = await runner()

      if (shouldPurifyEnv) {
        this.setGitNameAndEmail()
      }

      return runResult
    },
  }
}
