export default {
	chat: {
		channel: {
			createTooltip: 'Créer un nouveau canal',
			menu: {
				edit: {
					title: 'Modifier le canal',
					tabs: {
						general: {
							title: 'Général',
							type: 'Type du canal',
							typeInfo: 'Vous ne pouvez pas changer le type de canal',
							name: 'Nom',
							password: 'Mot de passe',
							newPassword: 'Nouveau mot de passe',
							oldPassword: 'Ancien mot de passe',
							protected: 'Ce canal est protégé par un mot de passe',
							success: 'Les modifications ont été effectuées',
							error: {
								name: 'Le canal doit avoir un nom',
								pass: 'L\'ancien mot de passe ne correspond pas',
								passNew: 'Le nouveau mot de passe ne doit pas être vide',
								toProtected: 'Un canal protégé nécessite un mot de passe',
								same: 'Le nouveau mot de passe est le même que l\'ancien'
							}
						},
						user: {
							title: 'Utilisateurs',
							badge: {
								administrator: 'administrateur',
								banned: 'banni',
								creator: 'créateur',
								muted: 'muet',
								user: 'utilisateur',
								delete: 'supprimer'
							},
							tooltip: {
								addUser: 'Ajouter un utilisateur',
								search: 'Rechercher un utilisateur'
							},
							timepicker: {
								banned: 'Choisissez la date et l\'heure auxquelles le bannissement prendra fin',
								muted: 'Choisissez la date et l\'heure à laquelle l\'utilisateur ne sera plus muet'
							},
							error: {
								time: 'L\'heure que vous avez saisie est inférieure à la date et à l\'heure actuelles',
								creator: 'Le créateur du canal est obligatoirement un administrateur, et ne peut être ni muet ou banni',
								admin: 'Vous ne pouvez pas modifier vous-même vos options',
								add: 'Une erreur s\'est produite. L\'utilisateur existe t-il toujours ?'
							},
							apply: 'Appliquer',
							reload: 'Recharger'
						},
						reset: 'Réinitialiser',
						apply: 'Appliquer les modifications',
						need: 'est nécessaire'
					}
				},
				delete: {
					title: 'Supprimer le canal',
					info: 'Êtes-vous sûr de vouloir supprimer le canal ?',
					explanation: 'Entrer le nom du canal pour confirmer sa suppression',
					error: 'Le nom du canal ne correspond pas',
					cancel: 'Annuler',
					delete: 'Supprimer'
				},
				alert: {
					close: 'Fermer',
					admin: {
						on: 'Vous êtes devenu un administrateur du canal {channel}',
						off: 'Vous n\'êtes plus un administrateur du canal {channel}'
					},
					banned: {
						on: 'Vous êtes banni du canal {channel} jusqu\'au {date}',
						off: 'Vous n\'êtes plus banni du canal {channel}'
					},
					muted: {
						on: 'Vous êtes muet sur le canal {channel} jusqu\'au {date}',
						off: 'Vous n\'êtes plus muet sur le canal {channel}'
					}
				},
				quit: 'Quitter le canal'
			},
			modal: {
				name: 'Nom du canal',
				type: 'Type du canal',
				public: 'Publique',
				protected: 'Protégé',
				private: 'Privé',
				password: 'Mot de passe du canal',
				repeat: 'Répéter le mot de passe',
				submit: 'Créer',
				error: 'Ce champ est obligatoire',
				errorPassword: 'Les mots de passe ne sont pas les mêmes',
				listErrors: {
					name: 'Le nom du canal est obligatoire',
					type: 'Le type de canal est obligatoire',
					password: 'Les mots de passes ne corresponde pas'
				}
			},
			passwordTooltip: 'Entrer le mot de passe',
			password: {
				password: 'Mot de passe du canal',
				error: 'Le mot de passe est obligatoire',
				valid: 'Valider',
				incorrect: 'Mot de passe invalide'
			}
		},
		editor: {
			image: 'Image',
			send: 'Envoyer',
			placeholder: 'Ecriver votre message'
		},
		menu: {
			edit: 'Modifier le message',
			delete: 'Supprimer le messagee'
		},
		message: {
			me: 'Moi'
		}
	}
};
