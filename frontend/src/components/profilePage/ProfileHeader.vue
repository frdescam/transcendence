<template>
	<div class="column" style="background-image: url(/background.png); background-position: center; background-size: cover; background-repeat: no-repeat;">
		<div class="q-pa-md full-width row items-center">
			<div v-bind:class="{ 'q-pr-md': $q.screen.gt.sm }"
				class="q-my-lg row full-height items-center justify-around col-md-2 col-12">
				<q-avatar class="q-my-auto" size=150px>
					<img :src='computedUser.avatar'>
					<q-badge v-if="computedUser.status == 'online'" class="absolute-bottom-right"
						style="width: 30px; height: 30px" color="light-green-14" rounded>
						<q-tooltip>{{ computedUser.status }}</q-tooltip>
					</q-badge>
					<q-badge v-if="computedUser.status == 'offline'" class="absolute-bottom-right"
						style="width: 30px; height: 30px" color="red" rounded>
						<q-tooltip>{{ computedUser.status }}</q-tooltip>
					</q-badge>
					<q-badge v-if="computedUser.status == 'playing'" class="absolute-bottom-right"
						style="width: 30px; height: 30px" color="orange" rounded>
						<q-tooltip>{{ computedUser.status }}</q-tooltip>
					</q-badge>
				</q-avatar>
			</div>
			<div class="col-md-10 col-12">
				<div class="fit column q-pa-sm" style="background: rgba(0, 0, 0, 0.4); border-radius: 10px">
					<div class="q-pa-sm row col-3 items-center">
						<div v-bind:class="{ 'justify-center': $q.screen.lt.md }" class="col-12 col-md-6 row"
							style="height: 4em">
							<div style="font-size: 3em; color: #eee;">{{ computedUser.pseudo }}</div>
							<div class="text-weight-bold q-ml-sm" style="font-size: 3em; color: #eee;">
								#{{ computedUser.rank }}</div>
						</div>
						<div v-bind:class="$q.screen.lt.md ? 'text-center' : 'text-right'" class="col-12 col-md-6"
							style="font-size: 1.5em; color: #eee;">Ratio : {{ computedUser.ratio }}%</div>
					</div>
					<q-badge class="col-5 q-mx-auto"
						style="font-size: 3em; color: #eee; height: 75px; background: rgba(0, 0, 0, 0.4); border-radius: 15px">
						Level {{ computedUser.level }}</q-badge>
					<div class="row justify-between col-2 items-end">
						<div style="color: #eee;" class="q-mb-none">Next level :</div>
						<div style="color: #eee;" class="q-mb-none">{{ computedUser.xpToNextLevel }} / 100 XP</div>
					</div>
					<div class="col-2">
						<q-linear-progress stripe rounded class="q-mt-sm" size="20px"
							:value="computedUser.xpToNextLevel / 100" color="blue" />
					</div>
				</div>
			</div>
		</div>
		<q-item class="full-width row justify-around">
			<q-btn @click="onDeleteFriend()" style="background: rgba(0, 0, 0, 0.4); color: #eee;" label="add friend" />
			<q-btn :href="'chat/' + computedUser.pseudo" style="background: rgba(0, 0, 0, 0.4); color: #eee;"
				label="send a message" />
			<q-btn @click="onBlockUser()" style="background: rgba(0, 0, 0, 0.4); color: #eee;" label="block user" />
		</q-item>
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
		const computedUser = {
			id: props.user.id,
			fortytwo_id: props.user.fortytwo_id,
			pseudo: props.user.pseudo,
			refresh_token: props.user.refresh_token,
			email: props.user.email,
			password: props.user.password,
			avatar: props.user.avatar,
			is2FActive: props.user.is2FActive,
			secretOf2FA: props.user.secretOf2FA,
			level: parseInt(props.user.xp),
			xpToNextLevel: parseInt((props.user.xp - parseInt(props.user.xp)) * 100),
			ratio: props.user.ratio,
			rank: props.user.rank,
			status: props.user.status
		};

		async function onDeleteFriend ()
		{
			console.log('removing friend!');
		}

		async function onBlockUser ()
		{
			console.log('blocking user!');
		}

		return {
			computedUser,

			onDeleteFriend,
			onBlockUser
		};
	}
});
</script>
