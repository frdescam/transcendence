export interface admBanMut {
  id: number,
  userId: number,
  channelId: number,
  until: Date
}

export interface blockedUser {
  id: number,
  blockedId: number
}

export interface receiveChannel {
  id: number,
  creator: number,
  name: string,
  type: string,
  password: string,
  users?: Array<number>
}

export interface passwordCompare {
  channelId: number,
  password: string
}

export interface receiveInvitation {
  creatorId: number,
  creatorName: string,
  invitationId: number,
  invitationName: string,
  gameLink: string,
  approvalFromInvitedUser?: boolean
}

export interface receiveMessage {
  id: number,
  channel: number,
  message: string,
  length: number,
  timestamp: Date,
  hash: string
}

export interface updateMessage {
  id: number,
  channel: number,
  messageId: number,
  message: string,
  length: number,
  timestamp: Date,
  hash: string
}

export interface channelUser {
  userId: number,
  channelId: number,
}

export interface timestamp {
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
	second: number,
	millisecond: number
}
