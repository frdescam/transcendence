<template>
	<div class="q-pa-md">
		<q-list class="row justify-evenly shadow-2 rounded-borders">
			<q-toolbar>
				<q-toolbar-title class="q-pa-md">Your friends :</q-toolbar-title>
				<q-input borderless dense debounce="300" v-model="filter" @update:model-value="onFilterChange" placeholder="Search">
					<template v-slot:append>
						<q-icon name="search"/>
					</template>
				</q-input>
			</q-toolbar>
			<q-item v-for="friend in filteredFriends" :key="friend.id" clickable v-ripple @click="onFriendClick(friend.pseudo)" class="column items-center q-ma-md q-pa-none rounded-borders shadow-2" style="width: 300px">
				<q-responsive :ratio="1" class="full-width">
					<q-avatar rounded class="full-width full-height">
						<img :src='friend.avatar'>
					</q-avatar>
				</q-responsive>
				<div class="row q-pt-md" style="font-size: 2em;">
					<q-badge v-if="friend.status == 'online'" class="q-my-auto q-mr-sm" style="width: 30px; height: 30px" color="light-green-14" rounded>
						<q-tooltip>{{ friend.status }}</q-tooltip>
					</q-badge>
					<q-badge v-if="friend.status == 'offline'" class="q-my-auto q-mr-sm" style="width: 30px; height: 30px" color="red" rounded>
						<q-tooltip>{{ friend.status }}</q-tooltip>
					</q-badge>
					<q-badge v-if="friend.status == 'playing'" class="q-my-auto q-mr-sm" style="width: 30px; height: 30px" color="orange" rounded>
						<q-tooltip>{{ friend.status }}</q-tooltip>
					</q-badge>
						<div>{{ friend.pseudo }}</div>
					<div class="q-ml-sm text-weight-bold">#{{ friend.rank }}</div>
				</div>
				<div style="font-size: 1.5em;">Level : {{ friend.level }}</div>
				<div class="q-pb-md" style="font-size: 1em;">ratio : {{ friend.ratio }}</div>
			</q-item>
		</q-list>
	</div>
</template>

<script>
import { ref } from '@vue/reactivity';
import { useRouter } from 'vue-router';

const friends = ref([
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
]);

const filteredFriends = ref([...friends.value]);

export default {
	name: 'FriendsPage',
	setup ()
	{
		const router = useRouter();
		const filter = ref('');

		async function onFriendClick (friendPseudo)
		{
			router.push('/profile/' + friendPseudo);
		}

		async function onFilterChange (value)
		{
			filteredFriends.value = friends.value.filter(friend => friend.pseudo.toLowerCase().includes(filter.value.toLowerCase()));
		}

		return {
			filteredFriends,
			filter,

			onFriendClick,
			onFilterChange
		};
	}
};
</script>
