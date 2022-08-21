interface admBanMut {
  id: number,
  userId: number,
  channelId: number,
  until: Date
}

interface receiveChannel {
  id: number,
  creator: number,
  name: string,
  type: string,
  password: string,
  users?: Array<number>
}

interface receiveMessage {
  id: number,
  channel: number,
  message: string,
  length: number,
  timestamp: Date,
  hash: string
}

interface updateMessage {
  id: number,
  channel: number,
  messageId: number,
  message: string,
  length: number,
  timestamp: Date,
  hash: string
}

interface channelUser {
  userId: number,
  channelId: number,
}

interface timestamp {
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
	second: number,
	millisecond: number
}

export { 
  admBanMut,
  receiveChannel,
  receiveMessage,
  updateMessage,
  channelUser,
  timestamp
};
