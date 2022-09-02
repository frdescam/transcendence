export default {
	menu: {
		title: 'transcendance',
		play: 'jouer',
		chat: 'chat',
		leaderboard: 'classement',
		setting: 'paramètre du compte',
		retake: 'reprendre la partie',
		disconnect: 'déconnexion',
		playing: 'vous jouez actuellement sur {map}',
		notPlaying: 'vous ne jouez pas'
	},
	// pages
	chat: {
		title: 'chat',
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
								emptyOld: 'L\'ancien mot de passe ne doit pas être vide',
								emptyNew: 'Le nouveau mot de passe ne doit pas être vide',
								toProtected: 'Un canal protégé nécessite un mot de passe',
								same: 'Le nouveau mot de passe est le même que l\'ancien',
								passCheck: 'L\'ancien mot de passe ne correspond pas',
								update: 'Une erreur s\'est produite avec le serveur, veuillez réessayer plus tard'
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
			},
			invitation: {
				creator: {
					title: 'Invitation',
					text: 'Voulez-vous inviter {user} à jouer ?',
					map: 'Sélectionnez la carte sur laquelle vous voulez jouer',

					error: 'Apparemment, vous avez déjà demandé à une autre personne de faire une partie, mais elle n\'a pas répondu. Lorsque celle-ci aura accepté ou refusé, vous pourrez refaire votre demande',
					unknown: 'Une erreur inconnue s\'est produite, veuillez réessayer dans quelques minutes.',

					pending: 'En attente de la validation de {user}',

					accepted: '{user} a accepté l\'invitation, vous serez redirigé dans 5 secondes. Sinon, cliquez sur le bouton ci-dessous',
					refused: '{user} a refusé l\'invitation. La fenêtre se fermera dans 5 secondes. Sinon, cliquez sur le bouton ci-dessous',
					close: 'Fermer la fenêtre'
				},
				player: {
					title: 'Vous êtes invité par {creator} à jouer une partie',
					yes: 'Commencer la partie',
					no: 'Refuser la partie'
				}
			},
			dateFormat: '{day}/{month}/{year} - {hour}h{minute}'
		},
		user: {
			profile: 'Voir le profil',
			xp: 'xp',
			sendMessage: 'Envoyer un message',
			invite: 'Envoyer une invitation à jouer',
			block: 'Bloquer l\'utilisateur',
			unblock: 'Débloquer l\'utilisateur'
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
		},
		mp: 'Message(s) privé(s)',
		quit: {
			info: 'Voulez-vous quitter le canal ?',
			creator: 'Vous êtes le créateur du canal, il sera immédiatement supprimé lorsque vous le quitterez. Voulez-vous le quitter ?'
		},
		socket: 'La connexion a été interrompu, reconnexion en cours'
	},
	error: {
		404: '404',
		title: 'Oups, rien ici...',
		label: 'Aller à la page d\'accueil'
	},
	friend: {
		title: 'Vos amis',
		search: 'rechercher',
		noMatch: 'aucun résultat trouvé',
		noData: 'aucune donnée disponible',
		message: 'envoyer un message',
		delete: 'supprimer un ami',
		watch: 'regarder le jeu',
		rank: '#{rank}',
		level: 'niveau: {level}',
		ratio: 'ratio: {ratio}'
	},
	game: {
		creation: {
			title: 'création d\'une partie',
			mapSelection: 'sélection de la carte',
			play: {
				anyone: 'jouer avec n\'importe qui',
				friend: 'jouer avec un ami',
				button: 'jouer'
			},
			opponent: 'sélection d\'un adversaire'
		},
		listView: {
			columns: {
				room: 'identifiant de la chambre',
				map: 'carte',
				scores: 'scores',
				players: 'joueurs',
				status: 'status',
				creation: 'date de création'
			},
			vs: 'vs'
		},
		gameInterface: {
			controls: 'contrôles',
			wheel: 'molette',
			mouse: 'molette de la souris',
			keyboard: 'clavier',
			cursor: 'curseur',
			graphics: 'graphiques',
			window: 'fenêtre',
			fullscreen: 'plein écran',
			accessibility: 'accessibilité',
			play: 'jouer',
			pause: 'pause',
			give: 'abandonner',
			quality: {
				minimum: 'minimum',
				low: 'faible',
				average: 'moyenne',
				good: 'bon',
				high: 'élevé',
				ultra: 'ultra'
			}
		},
		gameView: {
			refresh: 'rafraîchir',
			state: {
				connected: 'en connection',
				state: 'en attente de l\'état de jeu',
				default: 'chargement de la carte'
			}
		}
	},
	index: {
		exp: 'xp',
		friends: 'vos amis',
		noData: 'aucune donnée disponible',
		noFriends: 'aucun ami à afficher pour le moment',
		level: 'niveau',
		nextLevel: 'niveau suivant :',
		ratio: 'ratio',
		buttons: {
			chat: 'discuter avec vos amis',
			checkoutGame: 'consultez les jeux en direct',
			checkoutLeader: 'consultez le classement',
			edit: 'modifier vos paramètres',
			start: 'démarrer une partie'
		}
	},
	inputs: {
		adversary: 'adversaire',
		adversaryHint: 'si elle est sélectionnée, une invitation sera envoyée',
		map: 'carte',
		mapHint: 'la carte affecte la vitesse de la balle et permet des contrôles',
		room: 'nom de la salle',
		roomHint: 'le nom de la partie, qui sera dans l\'URL',
		matchHint: 'si vous êtes sélectionné, vous serez mis en file d\'attente pour jouer avec cette personne en particulier',
		query: 'placer une requête',
		party: 'créer ma partie'
	},
	leaderboard: {
		rank: 'rang',
		player: 'joueur',
		ratio: 'ratio',
		level: 'niveau',
		friends: 'seulement mes amis',
		search: 'rechercher'
	},
	login: {
		button: 'connectez-vous avec',
		submit: 'envoyer',
		logout: 'déconnexion'
	},
	matching: {
		look: 'Rechercher une partie',
		with: 'avec la carte {map}',
		messages: {
			awaiting: 'En attente de la création de cette partie...',
			querying: 'Demande au serveur...',
			found: 'Réorientation vers la partie...',
			default: 'Connexion...'
		}
	},
	play: {
		matching: 'appariement',
		create: 'créer',
		explore: 'explorer'
	},
	profil: {
		search: 'rechercher',
		noMatch: 'aucun résultat trouvé',
		noData: 'aucune donnée disponible',
		achievements: {
			title: 'succès',
			list: {
				name: {
					title: 'name',
					subtitle: 'subname'
				}
			}
		},
		matches: {
			title: 'matches',
			map: 'carte: {map}'
		}
	},
	setting: {
		title: 'paramètres :',
		twoFactor: {
			title: 'authentification à double facteur',
			subtitleOn: 'l\'authentification à double facteurs est activée',
			subtitleOff: 'l\'authentification à double facteurs est désactivée',
			activate: 'activer',
			desactivate: 'désactiver'
		},
		delete: {
			title: 'supprimer votre compte',
			subtitleOne: 'êtes-vous sûr ?',
			subtitleTwo: 'vous perdrez toute votre progression'
		},
		user: {
			fieldRequired: 'le champ est obligatoire',
			currentPassword: 'mot de passe actuel',
			newPassword: 'nouveau mot de passe',
			update: 'mettre à jour'
		},
		profilPictureModal: {
			title: 'Vous pouvez modifier votre pseudo et votre photo de profil ici même :',
			pseudo: 'Modifier le pseudo',
			picture: 'Changement d\'image',
			update: 'mettre à jour',
			dismiss: 'fermer'
		}
	},
	twofa: {
		label: 'Entrez le code 2FA'
	}
};
