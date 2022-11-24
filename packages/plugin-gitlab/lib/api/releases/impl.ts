// const semver = require('semver')
// const fetchVersion = require('../version')
//
// let glVersion

/* eslint-disable @typescript-eslint/no-var-requires */

async function getImpl(kind) {
  const mod = require(`./by-tags/${kind}`)
  return mod.default ? mod.default : mod

  // if (!glVersion) {
  //   glVersion = (await fetchVersion()).version
  // }

  // у апи релизов есть проблемы с сортировкой
  // на данный момент проще использовать tags api все равно никаких данных из releases api pvm не использует
  // return semver.gte(semver.coerce(glVersion).version, '11.7.0') ? require(`./by-releases/${kind}`) : require(`./by-tags/${kind}`)
}

export default getImpl
