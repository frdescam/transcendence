export default {
	chat: {
		channel: {
			createTooltip: 'Create a new channel',
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
