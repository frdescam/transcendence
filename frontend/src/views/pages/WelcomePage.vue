<template>
	<q-list class="row q-ma-md justify-evenly shadow-2 rounded-borders bg-white">
		<q-toolbar class="row justify-evenly q-my-lg">
			<profileHeader :user="user"></profileHeader>
		</q-toolbar>
    <div class="row no-wrap justify-evenly item-stretch" style="width: 100%">
      <q-list class="column q-mt-md">
        <q-btn class="q-mb-md" :to="{ path: '/play' }" color="primary">{{ $t('index.buttons.start') }}</q-btn>
        <q-btn class="q-mb-md" :to="{ path: '/chat' }" color="primary">{{ $t('index.buttons.chat') }}</q-btn>
        <q-btn class="q-mb-md" :to="{ path: '/play/list' }" color="primary">{{ $t('index.buttons.checkoutGame') }}</q-btn>
      </q-list>
      <q-list class="column q-mt-md">
        <q-btn class="q-mb-md" :to="{ path: '/leaderboard' }" color="primary">{{ $t('index.buttons.checkoutLeader') }}</q-btn>
        <q-btn class="q-mb-xs" :to="{ path: '/settings' }" color="primary">{{ $t('index.buttons.edit') }}</q-btn>
      </q-list>
      <q-list bordered class="rounded-borders q-my-md">
        <q-item v-if="friendList.length == 0">{{ capitalize($t('index.noFriends')) }}</q-item>
        <q-item v-else clickable v-ripple v-for="friend in friendList" v-bind:key="friend.id">
          <q-item-section>
            {{friend}}
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-list>
	<q-dialog v-model="firstConnection">
		<div class="q-pa-md" style="background-color: white; max-width: 400px;">
			<h5 class="q-ma-md">{{ capitalize($t('setting.profilPictureModal.title')) }}</h5>
			<q-card bordered style='width: 300px;' class="q-ma-md">
				<q-card-section>
					<pseudoEditing :pseudo='user.pseudo' v-on:update:pseudo="user.pseudo = $event"></pseudoEditing>
				</q-card-section>
				<q-separator inset />
				<q-card-section>
					<pictureEditing :avatar='user.avatar'></pictureEditing>
				</q-card-section>
			</q-card>
			<q-btn flat v-close-popup>{{ $t('setting.profilPictureModal.dismiss') }}</q-btn>
		</div>
	</q-dialog>
</template>

<script lang="ts">
import pictureEditing from 'src/components/userSettings/pictureEditing.vue';
import pseudoEditing from 'src/components/userSettings/pseudoEditing.vue';
import profileHeader from 'src/components/profilePage/ProfileHeader.vue';
import { inject, ref, onMounted } from 'vue';
import { Capitalize } from 'src/boot/libs';
import { api } from 'boot/axios';

export default ({
	name: 'WelcomePage',
	components: {
		profileHeader,
		pseudoEditing,
		pictureEditing
	},

	setup ()
	{
		const capitalize: Capitalize = inject('capitalize') as Capitalize;

		const firstConnection = ref(true);
		const user = ref({});
		const friendList = ref([]);

		async function fetchUserInfo ()
		{
			const res = await api.get('/user/me', {});
			console.log(res.data);
			user.value = res.data;
		}
		async function fetchFriendList ()
		{
			const res = await api.get('/friends/accepted');
			console.log(res.data);
			friendList.value = res.data;
		}

		onMounted(() =>
		{
			fetchUserInfo();
			fetchFriendList();
		});

		return {
			capitalize,

			user,
			firstConnection,
			friendList
		};
	}
});
</script>
