
export function noPackagesInMugError(): Error {
  // пустая unified группа, не очень хороший кейс
  // нужно либо задать release_tag_package
  // либо сделать главную группу не пустой
  return new Error([
    `Setting "versioning.unified" is true, but there are no packages in main unified group.`,
    `Either set up "tagging.release_tag_package" setting, or check "versioning.unified_versions_for" and "versioning.independent_packages" settings.`,
    `Both "versioning.unified_versions_for" and "versioning.independent_packages" settings \
have higher priority than versioning.unified = true setting while distributing packages to groups`,
  ].join('\n'))
}
