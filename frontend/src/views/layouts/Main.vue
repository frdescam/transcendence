<template>
	<q-layout view="hHh lpR fFf">
		<q-header elevated>
			<q-toolbar id="header-contents" class="row justify-between">
				<q-btn flat no-caps no-wrap no-ripple :to="{ path: '/' }">
					<q-toolbar-title>
						<q-icon class="q-mr-sm"
							name="img:https://www.pinclipart.com/picdir/big/535-5355934_ping-pong-table-tennis-icon-png-clipart.png" />
						Transcendance
					</q-toolbar-title>
				</q-btn>
				<div class="row q-gutter-md no-wrap mobile-hide">
					<q-btn flat rounded :to="{ path: '/play' }" label="Play" />
					<q-btn flat rounded :to="{ path: '/chat' }" label="Chat" />
					<q-btn flat rounded :to="{ path: '/leaderboards' }" label="Leaderboards" />
				</div>
				<div class="row q-ml-md no-wrap">
					<q-btn flat rounded :to="{ path: '/login' }">
						<q-icon name="person" />
					</q-btn>
					<q-btn flat rounded :to="{ path: '/logout' }">
						<q-icon name="logout" />
					</q-btn>
				</div>
			</q-toolbar>
		</q-header>

		<q-page-container>
			<router-view />
		</q-page-container>
		<q-footer class="mobile-only row justify-evenly">
			<q-btn flat rounded :to="{ path: '/play' }" icon="sports_esports" />
			<q-btn flat rounded :to="{ path: '/chat' }" icon="chat" />
			<q-btn flat rounded :to="{ path: '/leaderboards' }" icon="leaderboards" />
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
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'MainLayout',

	setup ()
	{
		return {
		};
	}
});
</script>
