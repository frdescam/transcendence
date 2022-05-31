<template>
	<q-layout view="hHh lpR fFf">
		<q-header elevated>
			<q-toolbar id="header-contents" class="row justify-between">
				<q-btn flat no-caps no-wrap no-ripple :to="{ path: '/' }">
					<q-toolbar-title>
						<q-icon
							class="q-mr-sm"
							name="img:https://www.pinclipart.com/picdir/big/535-5355934_ping-pong-table-tennis-icon-png-clipart.png"
						/>
						Transcendance
					</q-toolbar-title>
				</q-btn>
				<div class="row q-gutter-md no-wrap mobile-hide">
					<q-btn flat rounded :to="{ path: '/play' }" label="Play"/>
					<q-btn flat rounded :to="{ path: '/chat' }" label="Chat"/>
					<q-btn flat rounded :to="{ path: '/leaderboards' }" label="Leaderboards"/>
				</div>
				<div class="row q-ml-md no-wrap">
					<q-btn flat rounded :to="{ path: '/logout' }"><q-icon name="logout"/></q-btn>
					<q-btn flat rounded :to="{ path: '/settings' }"><q-icon name="settings"/></q-btn>
					<q-btn flat rounded push>
						<q-icon name="notifications"/>
						<q-popup-proxy>
							<q-list dense bordered padding class="rounded-borders">
								<template v-for="(notification, index) in notifications" :key="notification.id">
									<q-item v-if="index < maxDisplayedNotifs">
										<q-item-section>
											{{ notification.text }}
										</q-item-section>
										<q-item-section side>
											<q-btn class="gt-xs" size="12px" flat dense round icon="delete" :to="{ path: '/api/notifications/{{ notification.id }}' }"/>
										</q-item-section>
									</q-item>
								</template>
								<q-item v-if="notifications.length > maxDisplayedNotifs">
									<q-item-section>
										And {{ notifications.length - maxDisplayedNotifs }} more...
									</q-item-section>
								</q-item>
								<q-separator spaced />
								<q-item clickable v-ripple :to="{ path: '/notifications' }">
									<q-item-section>
										See all notifications
									</q-item-section>
									<q-item-section side>
										<q-icon name="arrow_forward" />
									</q-item-section>
								</q-item>
							</q-list>
						</q-popup-proxy>
					</q-btn>
					<q-btn flat rounded :to="{ path: '/login' }"><q-icon name="person"/></q-btn>
				</div>
			</q-toolbar>
		</q-header>

		<q-page-container>
			<router-view />
		</q-page-container>
		<q-footer class="mobile-only row justify-evenly">
			<q-btn flat rounded :to="{ path: '/play' }" icon="sports_esports"/>
			<q-btn flat rounded :to="{ path: '/chat' }" icon="chat"/>
			<q-btn flat rounded :to="{ path: '/leaderboards' }" icon="leaderboards"/>
		</q-footer>
	</q-layout>
</template>

<style lang="scss">
#header-contents {
	max-width: 1200px;
	margin: auto;
}
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
	name: 'MainLayout',

	setup ()
	{
		const notifications = [ // This will need to be pulled from the db
			{ id: 0, text: 'Hello!' },
			{ id: 1, text: 'What\'s up?' },
			{ id: 2, text: '3rd notif' },
			{ id: 3, text: '4rd notif' },
			{ id: 4, text: '5rd notif' },
			{ id: 5, text: '6rd notif' },
			{ id: 6, text: '7rd notif' }
		];
		const maxDisplayedNotifs = 5; // This stays
		return {
			notifications,
			maxDisplayedNotifs
		};
	}
});
</script>
