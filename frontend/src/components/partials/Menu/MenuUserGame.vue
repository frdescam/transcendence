<template>
	<q-item clickable class="text-center" :to="{ name: 'party', params: { party: party.room } }" v-if="party">
		<q-item-section side class="inherit_color">
			<q-icon name="sports_esports" />
		</q-item-section>
		<q-item-section no-wrap>

			<q-item-label>
				{{ capitalize($t('menu.playing', { map: party.map[0].toUpperCase() + party.map.substring(1) })) }}
			</q-item-label>

			<q-item-label>
				<q-chip square :color="party.status == 'awaiting-player' ? 'orange' : 'green'">
					{{ countPlayers(party.players) + '/2' }}
				</q-chip>

				{{party.status[0].toUpperCase() + party.status.replace(/-/g, ' ').substring(1)}}

				<q-chip square :color="party.status == 'awaiting-player' ? 'grey' : 'blue'">
					{{ party.scores[0] }} - {{ party.scores[1] }}
				</q-chip>
			</q-item-label>

		</q-item-section>
	</q-item>
	<q-item clickable disable v-if="!party">
		<q-item-section side class="inherit_color">
			<q-icon name="sports_esports" />
		</q-item-section>
		<q-item-section no-wrap>
			<q-item-label>{{ capitalize($t('menu.notPlaying')) }}</q-item-label>
		</q-item-section>
	</q-item>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import { Capitalize } from 'src/boot/libs';
import type { userId } from 'src/common/game/types';

export default defineComponent({
	name: 'PartialMenuUserDropdownGame',
	props: ['connected', 'party'],
	setup ()
	{
		type usersArray = [userId | null, userId | null];

		const capitalize: Capitalize = inject('capitalize') as Capitalize;
		const countPlayers = (players: usersArray): number => (players.filter((userId: userId | null) => (!!userId)).length);

		return {
			capitalize,
			countPlayers
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
