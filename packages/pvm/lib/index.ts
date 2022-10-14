import { Pvm as BasePvm } from '@pvm/core/lib/app'
import { GET_PACKAGE_API_TOKEN, PUBLISH_API_TOKEN } from '@pvm/plugin-core'

export class Pvm extends BasePvm {
  get getPackages() {
    return this.container.get(GET_PACKAGE_API_TOKEN)
  }

  get publish() {
    return this.container.get(PUBLISH_API_TOKEN)
  }
}
