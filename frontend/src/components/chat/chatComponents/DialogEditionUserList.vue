<template>
	<q-item>
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
			:style="(data.isCreator) ? 'cursor: not-allowed' : ''"
		>
			<q-tooltip
				v-if="data.isCreator"
				class="bg-purple text-body2"
				anchor="top middle"
			>
				{{ $t('chat.channel.menu.edit.tabs.user.error.creator') }}
			</q-tooltip>
			<div class="toggle-section">
				<span>{{ capitalize($t('chat.channel.menu.edit.tabs.user.badge.administrator')) }}</span>
				<q-toggle
					v-model="data.isAdmin"
					checked-icon="security"
					color="green"
					size="lg"
					:disable="data.isCreator || !connectedUser.isCreator"
				/>
			</div>
			<div class="toggle-section">
				<span>{{ capitalize($t('chat.channel.menu.edit.tabs.user.badge.muted')) }}</span>
				<q-toggle
					v-model="data.isMuted"
					checked-icon="dangerous"
					color="green"
					size="lg"
					:disable="data.isCreator || !connectedUser.isAdmin"
				/>
			</div>
			<div class="toggle-section">
				<span>{{ capitalize($t('chat.channel.menu.edit.tabs.user.badge.banned')) }}</span>
				<q-toggle
					v-model="data.isBanned"
					checked-icon="dangerous"
					color="green"
					size="lg"
					:disable="data.isCreator || !connectedUser.isAdmin"
				/>
			</div>
		</q-item-section>
	</q-item>
	<q-separator />
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from 'vue';

interface usersOptionsInterface {
	id: number,
	isCreator: boolean,
	isAdmin: boolean,
	bannedId: number,
	isBanned: boolean,
	mutedId: number,
	isMuted: boolean
}

export default defineComponent({
	name: 'chat_dialog_edit_user_list',
	props: ['user', 'info', 'connectedUser', 'errorOccur'],
	emits: ['dialog-edition-users-timepicker', 'dialog-edition-users-admin'],
	setup (props, { emit })
	{
		const data: usersOptionsInterface = reactive({
			id: props.user.id,
			isCreator: props.info.isCreator,
			isAdmin: props.info.isAdmin,
			mutedId: props.info.mutedId,
			isMuted: props.info.isMuted,
			bannedId: props.info.bannedId,
			isBanned: props.info.isBanned
		});

		const avatarError = (e: Event) =>
		{
			const target = e.target as HTMLImageElement;
			if (target)
				target.src = 'imgs/chat/default.webp';
		};

		const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

		watch(() => data.isAdmin, () =>
		{
			emit('dialog-edition-users-admin', data.id, data.isAdmin);
		});

		watch(() => data.isBanned, () =>
		{
			emit('dialog-edition-users-timepicker', data.id, data.bannedId, data.isBanned, 'banned');
		});

		watch(() => data.isMuted, () =>
		{
			emit('dialog-edition-users-timepicker', data.id, data.mutedId, data.isMuted, 'muted');
		});

		watch(() => props.errorOccur, () =>
		{
			if (props.errorOccur.id === data.id)
			{
				console.log('user list', props.info);
				if (props.errorOccur.type === 'banned')
					data.isBanned = props.info.isBanned;
				else
					data.isMuted = props.info.isMuted;
			}
		});

		return {
			data,
			capitalize,
			avatarError
		};
	}
});
</script>
