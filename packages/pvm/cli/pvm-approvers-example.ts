import chalk from 'chalk'
import {
  projectApprovals, mergeRequestApprovals, gitlabEnv,
  setApprovers, ownersWithoutDogs, findOpenSingleMr,
  getMaintainers,
  // setApprovalsRequired
} from '@pvm/gitlab'
import { readCodeOwners } from '@pvm/cowners'
import { changedFiles } from '@pvm/pkgset/lib/changed-files'
import drainItems from '@pvm/core/lib/iter/drain-items'

async function main() {
  const codeOwners = await readCodeOwners()
  const approvalsConfig = await projectApprovals(gitlabEnv.projectId)
  const mr = await findOpenSingleMr()
  const mrApprovalsConfig = await mergeRequestApprovals(gitlabEnv.projectId, mr.iid)

  console.log(
    chalk`{blueBright self approval is enabled for project}: {yellowBright ${approvalsConfig.merge_requests_author_approval.toString()}}`
  )
  console.log(chalk`{blueBright approvals required}: {yellowBright ${mrApprovalsConfig.approvals_required.toString()}}`)
  console.log(chalk`{blueBright approvals left}: {yellowBright ${mrApprovalsConfig.approvals_left.toString()}}`)

  // getMaintainers returns async iterator, using drainItems in order to get flat array
  const maintainers = await drainItems(getMaintainers())
  console.log(chalk`{blueBright project maintainers}:`)
  console.log(chalk.yellowBright(maintainers.map(user => user.username).join('\n')))

  const { files } = changedFiles()

  console.log(chalk`{blueBright changed files in current MR}:`)
  console.log(chalk.yellowBright(files.join('\n')))

  if (codeOwners) {
    const affectedGroups = codeOwners.affectedGroups(files)
    let newApprovers: string[] = []
    console.log(chalk`{blueBright affected codeowners}:`)
    for (const group of affectedGroups) {
      console.log(chalk`{yellowBright ${group.pattern}} => {yellowBright ${group.owners.join(',')}}`)
      newApprovers = newApprovers.concat(group.owners)
    }

    // get rid of @
    newApprovers = ownersWithoutDogs(newApprovers)

    console.log(
      chalk`{blueBright about to set new approvers} {yellowBright [${newApprovers.join(',')}]} {blueBright for mr} {yellowBright "${mr.title}"}`
    )
    await setApprovers(gitlabEnv.projectId, mr.iid, newApprovers)

    // set minimal approvals
    // WARNING! this feature is unstable and intend to be fixed only in gitlab v12.2
    // see https://gitlab.com/gitlab-org/gitlab-ee/issues/12055 for the details
    // await setApprovalsRequired(gitlabEnv.projectId, mr.iid, newApprovers.length)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exitCode = 1
  })
