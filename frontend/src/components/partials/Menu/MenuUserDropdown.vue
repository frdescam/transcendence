<template>
	<q-btn-dropdown
		v-if="!state.loading && state.loggedIn"
		no-caps
		no-wrap
		stretch
		flat
		:dense="$q.screen.lt.md"
	>
		<template v-slot:label>
			<q-avatar :class="clsx($q.screen.gt.md && 'on-left')">
				<img :src="`${state.myself.avatar}?${state.userStateUpdatedAt}`">
			</q-avatar>
			<span class="block" v-if="$q.screen.gt.md">
				{{state.myself.username}}
			</span>
		</template>
		<q-list>

			<q-item clickable :to="{name: 'settings'}">
				<q-item-section side class="inherit_color">
					<q-icon name="settings" />
				</q-item-section>
				<q-item-section no-wrap>
					<q-item-label>Account settings</q-item-label>
				</q-item-section>
			</q-item>

			<MenuUserGame :party="gameState.party" :connected="gameState.connected"/>

			<q-separator inset />

			<q-item clickable :to="{name: 'logout'}">
				<q-item-section side class="inherit_color">
					<q-icon name="logout" />
				</q-item-section>
				<q-item-section no-wrap>
					<q-item-label>Disconnect</q-item-label>
				</q-item-section>
			</q-item>

		</q-list>
	</q-btn-dropdown>
</template>

<script lang="ts">
import { defineComponent, inject, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import clsx from 'clsx';
import MenuUserGame from './MenuUserGame.vue';
import type { State } from 'src/boot/state';
import type { getPartyDto } from 'src/common/game/orm/getParty.dto';
import type { getUserPartyDto } from 'src/common/game/orm/getUserParty.dto';
import type { Socket } from 'socket.io-client';

type stateType =
{
	connected: boolean,
	party: getPartyDto | null
};

export default defineComponent({
	name: 'PartialMenuUserDropdown',
	components: {
		MenuUserGame
	},
	setup ()
	{
		const state = inject('state') as State;
		const gameSocket: Socket = inject('socketGame') as Socket;
		const gameState = reactive<stateType>({ connected: false, party: null });
		const myId = ref<number | undefined>(undefined);

		function onDisconnect ()
		{
			gameState.connected = false;
			gameSocket.emit('game::userinfos::leave', {
				id: myId.value
			});
		}
		function onConnected ()
		{
			gameState.connected = true;
			gameSocket.emit('game::userinfos::join', {
				id: myId.value
			});
		}
		function onUpdate (data: getUserPartyDto)
		{
			if (data.userId !== myId.value)
				return;
			gameState.party = data.party;
		}

		onMounted(() =>
		{
			if (typeof state.myself === 'undefined' || typeof state.myself.id === 'undefined')
				return;
			myId.value = state.myself.id;
			gameSocket.on('game::userinfos', onUpdate);
			gameSocket.on('disconnect', onDisconnect);
			gameSocket.on('connect', onConnected);
			if (gameSocket.connected)
				onConnected();
		});
		onBeforeUnmount(() =>
		{
			onDisconnect();
			gameSocket.off('game::userinfos', onUpdate);
			gameSocket.off('disconnect', onDisconnect);
			gameSocket.off('connect', onConnected);
		});

		return {
			clsx,
			state,
			gameState
		};
	}
});
</script>

<style scoped>
.inherit_color
{
	color: inherit;
}
</style>