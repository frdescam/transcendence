<template>
	<div class="q-pa-md">
		<q-list class="row justify-around shadow-2 rounded-borders">
			<q-toolbar>
				<q-toolbar-title class="q-pa-md">Your friends :</q-toolbar-title>
					<q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
						<template v-slot:append>
							<q-icon name="search"/>
						</template>
					</q-input>
				</q-toolbar>
			<q-card v-for="friend in friends" :key="friend.id" @click="onFriendClick(friend.pseudo)" class="column items-center q-ma-md q-px-auto q-pb-md" style="width: 300px">
					<q-responsive :ratio="1" class="full-width">
						<q-avatar rounded class="full-width full-height">
							<img :src='friend.avatar'>
						</q-avatar>
					</q-responsive>
					<div class="row" style="font-size: 2em;">
						<q-badge v-if="friend.status == 'online'" class="q-my-auto q-mr-sm" style="width: 30px; height: 30px" color="light-green-14" rounded></q-badge>
						<q-badge v-if="friend.status == 'offline'" class="q-my-auto q-mr-sm" style="width: 30px; height: 30px" color="red" rounded></q-badge>
						<q-badge v-if="friend.status == 'playing'" class="q-my-auto q-mr-sm" style="width: 30px; height: 30px" color="orange" rounded></q-badge>
						<div>{{ friend.pseudo }}</div>
						<div class="q-ml-sm text-weight-bold">#{{ friend.rank }}</div>
					</div>
					<div style="font-size: 1.5em;">Level : {{ friend.level }}</div>
					<div style="font-size: 1em;">ratio : {{ friend.ratio }}</div>
					<q-tooltip>{{ friend.status }}</q-tooltip>
			</q-card>
		</q-list>
	</div>
</template>

<script>
import { useRouter } from 'vue-router';

const friends = [
	{
		id: 1,
		pseudo: 'Pohl',
		avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
		rank: 42,
		level: 101,
		ratio: 42,
		status: 'online'
	},
	{
		id: 2,
		pseudo: 'Buom',
		avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
		rank: 42,
		level: 101,
		ratio: 42,
		status: 'offline'
	},
	{
		id: 3,
		pseudo: 'cbertran',
		avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
		rank: 42,
		level: 101,
		ratio: 42,
		status: 'playing'
	},
	{
		id: 4,
		pseudo: 'lt',
		avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
		rank: 42,
		level: 101,
		ratio: 42,
		status: 'playing'
	},
	{
		id: 5,
		pseudo: 'fdeĉ',
		avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
		rank: 42,
		level: 101,
		ratio: 42,
		status: 'online'
	}
];

export default {
	name: 'FriendsPage',
	setup ()
	{
		const router = useRouter();

		async function onFriendClick (friendPseudo)
		{
			router.push('/profile/' + friendPseudo);
		}

		return {
			friends,

			onFriendClick
		};
	}
};
</script>
