export type Message = {
  /**
   * Channel id or name (in case of slack) where to send message
   */
  channel?: string,
  /**
   * Main message
   */
  content: string,
  /**
   * Less important content that should be attached to post.
   * Example from mattermost.
   * https://developers.mattermost.com/integrate/admin-guide/admin-message-attachments/
   *
   * Options set is limited in order to support other possible messengers which may be less capable
   */
  attachments?: Array<{
    fallback?: string,
    pretext?: string,
    title?: string,
    text?: string,
  }>,
  /**
   * Displayed post author customization (not supported in all messengers)
   */
  author?: {
    name?: string,
    avatarEmoji?: string,
    avatarUrl?: string,
  },
}

export type MessengerClientConfig = Pick<Message, 'channel' | 'author'> & {
  /**
   * All the rest uniq config options that might need for messengers. Will be passed directly to client
   */
  [key: string]: any,
}
