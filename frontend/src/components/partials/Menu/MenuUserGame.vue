<template>
	<q-item clickable class="text-center" :to="{ name: 'party', params: { party: party.room } }" v-if="party">
		<q-item-section side class="inherit_color">
			<q-icon name="sports_esports" />
		</q-item-section>
		<q-item-section no-wrap>

			<q-item-label>
				You are currently playing on {{ party.map[0].toUpperCase() + party.map.substring(1) }}
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
			<q-item-label>You are not playing</q-item-label>
		</q-item-section>
	</q-item>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { userId } from 'src/common/game/types';

type usersArray = [userId | null, userId | null];

function countPlayers (players: usersArray): number
{
	return (players.filter((userId: userId | null) => (!!userId)).length);
}

export default defineComponent({
	name: 'PartialMenuUserDropdownGame',
	props: ['connected', 'party'],
	setup ()
	{
		return {
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
