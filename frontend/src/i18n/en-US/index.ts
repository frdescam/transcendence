export default {
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
								pass: 'The old password does not match',
								passNew: 'The new password must not be empty',
								toProtected: 'A protected channel requires a password',
								same: 'The new password is the same as the old one'
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
			}
		},
		user: {
			sendMessage: 'Send message',
			invite: 'Send an invitation to play'
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
		}
	}
};
