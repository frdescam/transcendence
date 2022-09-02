export default {
	menu: {
		title: 'transcendance',
		play: 'play',
		chat: 'chat',
		leaderboard: 'leaderboard',
		setting: 'account setting',
		retake: 'retake the game',
		disconnect: 'disconnect',
		playing: 'you are currently playing on {map}',
		notPlaying: 'you are not playing'
	},
	// pages
	chat: {
		channel: {
			createTooltip: 'Create a new channel',
			menu: {
				edit: {
					title: 'Edit channel',
					tabs: {
						general: {
							title: 'General',
							type: 'Type of channel',
							typeInfo: 'You cannot change the channel type',
							name: 'Name',
							password: 'Password',
							newPassword: 'New password',
							oldPassword: 'Old password',
							protected: 'This channel is protected by a password',
							success: 'The modifications have been made',
							error: {
								name: 'The channel must have a name',
								emptyOld: 'The old password must not be empty',
								emptyNew: 'The new password must not be empty',
								toProtected: 'A protected channel requires a password',
								same: 'The new password is the same as the old one',
								passCheck: 'The old password does not match',
								update: 'An error with the server occurred, please try again later'
							}
						},
						user: {
							title: 'Users',
							badge: {
								administrator: 'administrator',
								banned: 'banned',
								creator: 'creator',
								muted: 'muted',
								user: 'user',
								delete: 'delete'
							},
							tooltip: {
								addUser: 'Add new user',
								search: 'Search user'
							},
							timepicker: {
								banned: 'Choose the date and time when the ban will end',
								muted: 'Choose the date and time when the user will no longer be muted'
							},
							error: {
								time: 'The time you entered is less than the current date and time',
								creator: 'The channel creator must be an administrator, and cannot be mute or banned',
								admin: 'You cannot change your options yourself',
								add: 'An error has occurred. The user still exists ?'
							},
							apply: 'Apply',
							reload: 'Reload'
						},
						reset: 'Reset',
						apply: 'Apply changes',
						need: 'is needed'
					}
				},
				delete: {
					title: 'Delete channel',
					info: 'Are you sure you want to remove the channel ?',
					explanation: 'Enter name of the channel to confirm its deletion',
					error: 'The channel name does not match',
					cancel: 'Cancel',
					delete: 'Delete'
				},
				alert: {
					close: 'Close',
					admin: {
						on: 'You have become an administrator of channel {channel}',
						off: 'You are no longer an administrator of channel {channel}'
					},
					banned: {
						on: 'You are banned of channel {channel} until {date}',
						off: 'You are no longer banned of channel {channel}'
					},
					muted: {
						on: 'You are muted of channel {channel} until {date}',
						off: 'You are no longer muted of channel {channel}'
					}
				},
				quit: 'Quit channel'
			},
			modal: {
				name: 'Name of channel',
				type: 'Channel type',
				public: 'Public',
				protected: 'Protected',
				private: 'Private',
				password: 'Password of channel',
				repeat: 'Repeat password',
				submit: 'Create',
				error: 'This field is required',
				errorPassword: 'Passwords are not the same',
				listErrors: {
					name: 'The channel name is required',
					type: 'The type of channel is mandatory',
					password: 'Passwords don\'t match'
				}
			},
			passwordTooltip: 'Enter the password',
			password: {
				password: 'Password of channel',
				error: 'Password is required',
				valid: 'Validate',
				incorrect: 'Incorrect password'
			},
			invitation: {
				creator: {
					title: 'Invitation',
					text: 'Would you like to invite {user} to play ?',
					map: 'Select the map you want to play on',

					error: 'Apparently you have already asked someone else to do a party, but they did not respond. When this one will have accepted or refused, you will be able to redo your request',
					unknown: 'An unknown error has occurred, please try again in a few minutes',

					pending: 'Waiting for validation from {user}',

					accepted: '{user} has accepted the invitation, you will be redirected in 5 seconds. Otherwise click on the button below',
					refused: '{user} refused the invitation. The window will close in 5 seconds. Otherwise click on the button below',
					close: 'Close window'
				},
				player: {
					title: 'You are invited by {creator} to play a party',
					yes: 'Start the game',
					no: 'Refuse the game'
				}
			},
			dateFormat: '{month}/{day}/{year} - {hour}h{minute}'
		},
		user: {
			profile: 'See profile',
			xp: 'xp',
			sendMessage: 'Send message',
			invite: 'Send an invitation to play',
			block: 'Block user',
			unblock: 'Unblock user'
		},
		editor: {
			image: 'Image',
			send: 'Send',
			placeholder: 'Write your message'
		},
		menu: {
			edit: 'Edit message',
			delete: 'Delete message'
		},
		message: {
			me: 'Me'
		},
		mp: 'Private message(s)',
		quit: {
			info: 'Do you want to leave the channel ?',
			creator: 'You are the creator of the channel, this one will be immediately deleted when you leave. Do you want to leave it ?'
		},
		socket: 'The connection has been lost, reconnection in progress'
	},
	error: {
		404: '404',
		title: 'Oops, nothing here...',
		label: 'Go home'
	},
	friend: {
		title: 'your friends',
		search: 'search',
		noMatch: 'no matching records found',
		noData: 'no data available',
		message: 'send message',
		delete: 'delete friend',
		watch: 'watch game',
		rank: '#{rank}',
		level: 'level: {level}',
		ratio: 'ratio: {ratio}'
	},
	game: {
		creation: {
			title: 'game creation',
			mapSelection: 'map selection',
			play: {
				anyone: 'play with anyone',
				friend: 'play with a friend',
				button: 'play'
			},
			opponent: 'opponent selection'
		},
		listView: {
			columns: {
				room: 'room id',
				map: 'map',
				scores: 'scores',
				players: 'players',
				status: 'status',
				creation: 'creation date'
			},
			vs: 'vs'
		},
		gameInterface: {
			controls: 'controls',
			wheel: 'wheel',
			mouse: 'mouse wheel',
			keyboard: 'keyboard',
			cursor: 'cursor',
			graphics: 'graphics',
			window: 'window',
			fullscreen: 'fullscreen',
			accessibility: 'accessibility',
			play: 'play',
			pause: 'pause',
			give: 'give up',
			quality: {
				minimum: 'minimum',
				low: 'low',
				average: 'average',
				good: 'good',
				high: 'high',
				ultra: 'ultra'
			}
		},
		gameView: {
			refresh: 'refresh',
			state: {
				connected: 'connecting',
				state: 'awaiting gamestate',
				default: 'loading map'
			}
		}
	},
	index: {
		exp: 'xp',
		friends: 'your friends',
		noData: 'no data available',
		noFriends: 'no friends to display yet',
		level: 'level',
		nextLevel: 'next level :',
		ratio: 'ratio',
		buttons: {
			chat: 'chat with your friends',
			checkoutGame: 'checkout live games',
			checkoutLeader: 'checkout the leaderboard',
			edit: 'edit your settings',
			start: 'start a game'
		}
	},
	inputs: {
		adversary: 'adversary',
		adversaryHint: 'if selected, an invitation would be sent',
		map: 'map',
		mapHint: 'the map affect ball\'s speed and allowed controls',
		room: 'room name',
		roomHint: 'the name of the party, which will be in the URL',
		matchHint: 'if selected, you will be queued to play with that person particularly',
		query: 'place a query',
		party: 'create my party'
	},
	leaderboard: {
		rank: 'rank',
		player: 'player',
		ratio: 'ratio',
		level: 'level',
		friends: 'only friends',
		search: 'search'
	},
	login: {
		button: 'Login with',
		submit: 'submit',
		logout: 'logging out'
	},
	matching: {
		look: 'Looking for party',
		with: 'with map {map}',
		messages: {
			awaiting: 'Awaiting such party to be created...',
			querying: 'Querying the server...',
			found: 'Redirecting to the party...',
			default: 'Connecting...'
		}
	},
	play: {
		matching: 'matching',
		create: 'create',
		explore: 'explore'
	},
	profil: {
		search: 'search',
		noMatch: 'no matching records found',
		noData: 'no data available',
		achievements: {
			title: 'achievements',
			list: {
				name: {
					title: 'name',
					subtitle: 'subname'
				}
			}
		},
		matches: {
			title: 'matches',
			map: 'map: {map}'
		}
	},
	setting: {
		title: 'settings :',
		twoFactor: {
			title: 'two factor authentication',
			subtitleOn: 'two factor authentication is activate',
			subtitleOff: 'two factor authentication is desactivate',
			activate: 'activate',
			desactivate: 'desactivate'
		},
		delete: {
			title: 'delete your account',
			subtitleOne: 'are you sure ?',
			subtitleTwo: 'you will lose all progress'
		},
		user: {
			fieldRequired: 'Field is required',
			currentPassword: 'current password',
			newPassword: 'new password',
			update: 'update'
		},
		profilPictureModal: {
			title: 'you can edit your pseudo and profile picture right here :',
			pseudo: 'change pseudo',
			picture: 'change picture',
			update: 'update',
			dismiss: 'dismiss'
		}
	},
	twofa: {
		label: 'enter 2FA code'
	}
};
