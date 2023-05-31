import { ArtifactsStorages } from '../../mechanics/artifacts/storage-manager'

export const cliArtifactsChoices = Object.values(ArtifactsStorages).map(key => {
  return key.replace(/.[A-Z]/g, (m) => `${m.charAt(0)}-${m.substr(1)}`).toLowerCase()
})
