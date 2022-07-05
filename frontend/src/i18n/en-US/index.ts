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
								user: 'user'
							}
						},
						muted: {
							title: 'Muted users'
						},
						banned: {
							title: 'Banned users'
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
			}
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
		}
	}
};
