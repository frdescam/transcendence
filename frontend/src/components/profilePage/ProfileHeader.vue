<template>
	<div class="col-md-10 col-12">
		<div class="fit column q-pa-sm" style="background: rgba(0, 0, 0, 0.4); border-radius: 10px">
			<div class="q-pa-sm row col-3 items-center">
				<div v-bind:class="{ 'justify-center': $q.screen.lt.md }" class="col-12 col-md-6 row"
					style="height: 4em">
					<div style="font-size: 3em; color: #eee;">{{ user.pseudo }}</div>
					<div class="text-weight-bold q-ml-sm" style="font-size: 3em; color: #eee;">
						#{{ user.rank }}</div>
				</div>
				<div v-bind:class="$q.screen.lt.md ? 'text-center' : 'text-right'" class="col-12 col-md-6"
					style="font-size: 1.5em; color: #eee;">Ratio : {{ user.ratio }}%</div>
			</div>
			<q-badge class="col-5 q-mx-auto"
				style="font-size: 3em; color: #eee; height: 75px; background: rgba(0, 0, 0, 0.4); border-radius: 15px">
				Level {{ parseInt(user.xp) }}</q-badge>
			<div class="row justify-between col-2 items-end">
				<div style="color: #eee;" class="q-mb-none">Next level :</div>
				<div style="color: #eee;" class="q-mb-none">{{ parseInt((user.xp - parseInt(user.xp)) * 100) }} / 100 XP</div>
			</div>
			<div class="col-2">
				<q-linear-progress stripe rounded class="q-mt-sm" size="20px"
					:value="parseInt((user.xp - parseInt(user.xp)) * 100) / 100" color="blue" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	props: [
		'user'
	],
	setup (props)
	{
		async function onDeleteFriend ()
		{
			console.log('removing friend!');
		}

		async function onBlockUser ()
		{
			console.log('blocking user!');
		}

		return {
			onDeleteFriend,
			onBlockUser
		};
	}
});
</script>
