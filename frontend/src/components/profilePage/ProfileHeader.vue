<template>
	<div class="col-md-10 col-12">
		<div class="fit column q-pa-sm" style="background: rgba(0, 0, 0, 0.4); border-radius: 10px">
			<div class="q-pa-sm row col-3 items-center">
				<div v-bind:class="{ 'justify-center': $q.screen.lt.md }" class="col-12 col-md-6 row" style="height: 4em">
					<div style="font-size: 3em; color: #eee;">
						{{ user.pseudo }}
					</div>
					<div class="text-weight-bold q-ml-sm" style="font-size: 3em; color: #eee;">
						{{ $t('friend.rank', { rank: user.rank }) }}
					</div>
				</div>
				<div v-bind:class="$q.screen.lt.md ? 'text-center' : 'text-right'" class="col-12 col-md-6" style="font-size: 1.5em; color: #eee;">
					{{ $t('index.ratio') }}: {{ user.ratio }}%
				</div>
			</div>
			<q-badge
				class="col-5 q-mx-auto"
				style="font-size: 3em;
				color: #eee;
				height: 75px;
				background: rgba(0, 0, 0, 0.4);
				border-radius: 15px"
			>
				{{ $t('index.level') }} {{ String(parseInt(user.xp)) }}
			</q-badge>
			<div class="row justify-between col-2 items-end">
				<div style="color: #eee;" class="q-mb-none">
					{{ capitalize($t('index.nextLevel')) }}
				</div>
				<div style="color: #eee;" class="q-mb-none">
					{{ calcXP(user) }} / 100 {{ $t('index.exp').toUpperCase() }}
				</div>
			</div>
			<div class="col-2">
				<q-linear-progress
					class="q-mt-sm"
					size="20px"
					color="blue"
					stripe
					rounded
					:value="calcXP(user) / 100"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import { Capitalize } from 'src/boot/libs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calcXP (user: any): number
{
	if (typeof user === 'object' && user && typeof user.xp !== 'undefined')
		return (parseFloat(user.xp) - Math.floor(parseFloat(user.xp))) * 100;
	return (0);
}

export default defineComponent({
	props: [
		'user'
	],
	setup: () =>
	{
		const capitalize: Capitalize = inject('capitalize') as Capitalize;

		return {
			capitalize,
			calcXP
		};
	}
});
</script>
