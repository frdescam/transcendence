<template>
	<q-item :data-userId="user.id">
		<q-item-section avatar>
			<q-avatar>
				<img :src="user.avatar" v-on:error="avatarError"/>
			</q-avatar>
		</q-item-section>
		<q-item-section class="overflow-text">{{ user.pseudo }}</q-item-section>
		<q-separator vertical class="sep" />
		<q-item-section class="badge-parent sep">
			<q-badge v-if="data.isCreator"
				color="purple-7" :label="$t('chat.channel.menu.edit.tabs.user.badge.creator')" class="badge"
			/>
			<q-badge v-if="data.isAdmin"
				color="light-green-7" :label="$t('chat.channel.menu.edit.tabs.user.badge.administrator')" class="badge"
			/>
			<q-badge v-if="data.isMuted"
				color="deep-orange-7" :label="$t('chat.channel.menu.edit.tabs.user.badge.muted')" class="badge"
			/>
			<q-badge v-if="data.isBanned"
				color="blue-grey-7" :label="$t('chat.channel.menu.edit.tabs.user.badge.banned')" class="badge"
			/>
			<q-badge
				color="light-blue-8" :label="$t('chat.channel.menu.edit.tabs.user.badge.user')" class="badge"
			/>
		</q-item-section>
		<q-separator vertical class="sep" />
		<q-item-section
			class="option-section"
			:style="(data.isCreator || connectedUser.id === data.id) ? 'cursor: not-allowed' : ''"
		>
			<q-tooltip
				v-if="data.isCreator"
				class="bg-purple text-body2"
				anchor="top middle"
			>
				{{ $t('chat.channel.menu.edit.tabs.user.error.creator') }}
			</q-tooltip>
			<q-tooltip
				v-else-if="connectedUser.id === data.id"
				class="bg-teal text-body2"
				anchor="top middle"
			>
				{{ $t('chat.channel.menu.edit.tabs.user.error.admin') }}
			</q-tooltip>
			<div class="toggle-section">
				<span>{{ capitalize($t('chat.channel.menu.edit.tabs.user.badge.administrator')) }}</span>
				<q-toggle
					@click="isMe = true"
					v-model="data.isAdmin"
					checked-icon="security"
					color="green"
					class="center-toggle"
					size="lg"
					:disable="data.isCreator || !connectedUser.isCreator || connectedUser.id === data.id"
				/>
			</div>
			<div class="toggle-section">
				<span>{{ capitalize($t('chat.channel.menu.edit.tabs.user.badge.muted')) }}</span>
				<q-toggle
					@click="isMe = true"
					v-model="data.isMuted"
					checked-icon="volume_mute"
					color="green"
					class="center-toggle"
					size="lg"
					:disable="data.isCreator || !connectedUser.isAdmin || connectedUser.id === data.id"
				/>
			</div>
			<div class="toggle-section">
				<span>{{ capitalize($t('chat.channel.menu.edit.tabs.user.badge.banned')) }}</span>
				<q-toggle
					@click="isMe = true"
					v-model="data.isBanned"
					checked-icon="dangerous"
					color="green"
					class="center-toggle"
					size="lg"
					:disable="data.isCreator || !connectedUser.isAdmin || connectedUser.id === data.id"
				/>
			</div>
			<div class="toggle-section">
				<span>{{ capitalize($t('chat.channel.menu.edit.tabs.user.badge.delete')) }}</span>
				<div class="delete-button-div">
					<q-btn
						class="delete-button center-toggle"
						round
						size="md"
						color="deep-orange"
						icon="person_remove"
						:disable="data.isCreator || !connectedUser.isCreator || connectedUser.id === data.id"
						@click="deleteUser"
					/>
				</div>
			</div>
		</q-item-section>
	</q-item>
	<q-separator />
</template>

<style>
.center-toggle {
	justify-content: center !important;
}
.delete-button {
	min-width: 42px;
	max-width: 42px;
}
.delete-button-div {
	display: inline-flex;
	justify-content: center;
}
</style>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from 'vue';

interface usersOptionsInterface {
	id: number, // primary_key inner table
	isCreator: boolean,
	isAdmin: boolean,
	bannedKey: number,
	bannedId: number,
	isBanned: boolean,
	mutedKey: number,
	mutedId: number,
	isMuted: boolean
}

export default defineComponent({
	name: 'chat_dialog_edit_user_list',
	props: [
		'user',
		'info',
		'connectedUser',
		'errorOccur'
	],
	emits: [
		'dialog-edition-users-timepicker',
		'dialog-edition-users-admin',
		'dialog-edition-users-delete'
	],
	setup (props, { emit })
	{
		const data: usersOptionsInterface = reactive({
			id: props.user.id,
			isCreator: props.info.isCreator,
			isAdmin: props.info.isAdmin,
			mutedKey: props.info.mutedKey,
			mutedId: props.info.mutedId,
			isMuted: props.info.isMuted,
			bannedKey: props.info.bannedKey,
			bannedId: props.info.bannedId,
			isBanned: props.info.isBanned
		});
		const isMe = ref(false);

		const avatarError = (e: Event) =>
		{
			const target = e.target as HTMLImageElement;
			if (target)
				target.src = 'imgs/chat/default.webp';
		};

		const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

		const deleteUser = () => emit('dialog-edition-users-delete', props.user.id);

		watch(() => props.info, () =>
		{
			isMe.value = false;
			data.isCreator = props.info.isCreator;
			data.isAdmin = props.info.isAdmin;
			data.isMuted = props.info.isMuted;
			data.isBanned = props.info.isBanned;
			data.mutedKey = props.info.mutedKey;
			data.mutedId = props.info.mutedId;
			data.bannedKey = props.info.bannedKey;
			data.bannedId = props.info.bannedId;
		}, { deep: true });

		watch(() => data.isAdmin, () =>
		{
			emit(
				'dialog-edition-users-admin',
				data.id,
				data.isAdmin
			);
		});

		watch(() => data.isBanned, () =>
		{
			if (isMe.value === true)
			{
				emit(
					'dialog-edition-users-timepicker',
					data.bannedKey,
					data.bannedId,
					data.isBanned,
					'banned'
				);
			}
			isMe.value = false;
		});

		watch(() => data.isMuted, () =>
		{
			if (isMe.value === true)
			{
				emit(
					'dialog-edition-users-timepicker',
					data.mutedKey,
					data.mutedId,
					data.isMuted,
					'muted'
				);
			}
			isMe.value = false;
		});

		watch(() => props.errorOccur, () =>
		{
			isMe.value = false;
			if (props.errorOccur.id === props.user.id)
			{
				if (props.errorOccur.type === 'banned')
					data.isBanned = false;
				else
					data.isMuted = false;
			}
		});

		return {
			data,
			isMe,
			capitalize,
			avatarError,
			deleteUser
		};
	}
});
</script>
