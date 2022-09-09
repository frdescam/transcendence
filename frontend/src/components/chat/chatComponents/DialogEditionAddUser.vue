<template>
	<q-dialog
		ref="dialog"
		model="fixed"
		square
		no-esc-dismiss
		no-backdrop-dismiss
		@hide="reset"
	>
		<q-card style="width: 40vw">
			<q-card-section class="row items-end justify-between">
				<div class="text-h6">{{ $t('chat.channel.menu.edit.tabs.user.tooltip.addUser') }}</div>
				<q-btn icon="close" flat round dense v-close-popup @click="reset"/>
			</q-card-section>
			<q-separator />

			<q-banner v-if="error" inline-actions class="text-white bg-red">
				{{ $t('chat.channel.menu.edit.tabs.user.error.add') }}
				<template v-slot:action>
					<q-btn
						flat
						color="white"
						:label="$t('chat.channel.menu.edit.tabs.user.reload')"
						@click="getUsers"
					/>
				</template>
			</q-banner>

			<q-card-section class="no-padding-bottom scroll">
				<q-input bottom-slots v-model="searchUser" :label="$t('chat.channel.menu.edit.tabs.user.tooltip.search')">
					<template v-slot:append>
						<q-icon v-if="searchUser" name="close" @click="searchUser = ''" class="cursor-pointer" />
						<q-icon name="search" />
					</template>
				</q-input>
			</q-card-section>
			<q-card-section class="users-list">
				<q-list>
					<template v-for="user in users" v-bind:key="user.id">
						<q-item v-if="((searchUser && search(user.pseudo)) || !searchUser) && !isAlreadyPresent(user.id)">
							<q-item-section avatar>
								<q-avatar>
									<img :src="user.avatar" v-on:error="avatarError"/>
								</q-avatar>
							</q-item-section>
							<q-separator vertical class="sep" />
							<q-item-section>{{ user.pseudo }}</q-item-section>
							<q-btn
								round
								color="green"
								icon="person_add"
								size="1em"
								@click="addUser(user.id)"
							/>
						</q-item>
					</template>
				</q-list>
			</q-card-section>
		</q-card>
	</q-dialog>
</template>

<style>
.no-padding-bottom {
	padding-bottom: 0;
}
.users-list {
	overflow-x: auto;
	max-height: 40vh;
}
</style>

<script lang="ts">
import { Socket } from 'socket.io-client';
import { QDialog } from 'quasar';
import { defineComponent, inject, onMounted, ref, watch } from 'vue';

export default defineComponent({
	name: 'dialog_edition_user_add',
	props: [
		'dialogEditionAddUserShow',
		'presentUser',
		'error'
	],
	emits: [
		'dialog-edition-users-close',
		'dialog-edition-users-add'
	],
	setup (props, { emit })
	{
		const socket: Socket = inject('socketChat') as Socket;

		const dialog = ref<QDialog>();
		const searchUser = ref();
		const users = ref();

		const getUsers = () => socket.emit('users::getAll');

		socket.on('users::receive::getAll', (ret) =>
		{
			users.value = ret.data;
		});

		const avatarError = (e: Event) =>
		{
			const target = e.target as HTMLImageElement;
			if (target)
				target.src = 'imgs/no_avatar.png';
		};

		const search = (value: string) =>
		{
			if (value.toLowerCase().indexOf(searchUser.value.toLowerCase()) > -1)
				return true;
			return false;
		};

		const isAlreadyPresent = (id: number) =>
		{
			for (const user of props.presentUser)
			{
				if (user.id === id)
					return true;
			}
			return false;
		};

		const addUser = (userId: number) =>
		{
			emit('dialog-edition-users-add', userId);
			reset();
		};

		const reset = () =>
		{
			emit('dialog-edition-users-close');
			searchUser.value = '';
		};

		onMounted(() => getUsers());

		watch(() => props.dialogEditionAddUserShow, (after) =>
		{
			if (after === true)
			{
				getUsers();
				dialog.value?.show();
			}
			else
				dialog.value?.hide();
		});

		return {
			dialog,
			searchUser,
			users,
			getUsers,
			avatarError,
			addUser,
			search,
			isAlreadyPresent,
			reset
		};
	}
});
</script>
