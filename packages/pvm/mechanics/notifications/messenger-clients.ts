import type { AbstractMessengerClient } from './abstract-messenger-client'

export class MessengerClients {
  messengers: Map<string, AbstractMessengerClient> = new Map()

  register(name: string, client: AbstractMessengerClient): void {
    this.messengers.set(name, client)
  }

  get(name: string): AbstractMessengerClient | undefined {
    return this.messengers.get(name)
  }

  getAll(): AbstractMessengerClient[] {
    return Array.from(this.messengers.values())
  }

  getFirstAvailable(): AbstractMessengerClient | undefined {
    return this.getAll().filter(client => client && client.isReady())[0]
  }
}
