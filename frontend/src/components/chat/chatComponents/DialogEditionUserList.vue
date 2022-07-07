<template>
	<q-item>
		<q-item-section avatar>
			<q-avatar>
				<img src="imgs/chat/default.webp" />
			</q-avatar>
		</q-item-section>
		<q-item-section class="overflow-text">{{ user.pseudo }} {{ user.id }}</q-item-section>
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
		<q-item-section class="option-section">
			<div class="toggle-section">
				<span>{{ capitalize($t('chat.channel.menu.edit.tabs.user.badge.administrator')) }}</span>
				<q-toggle
					v-model="data.isAdmin"
					checked-icon="security"
					color="green"
					size="lg"
					:disable="data.isCreator || !data.isAdmin"
				/>
			</div>
			<div class="toggle-section">
				<span>{{ capitalize($t('chat.channel.menu.edit.tabs.user.badge.muted')) }}</span>
				<q-toggle
					v-model="data.isMuted"
					checked-icon="dangerous"
					color="green"
					size="lg"
					:disable="!data.isAdmin"
				/>
			</div>
			<div class="toggle-section">
				<span>{{ capitalize($t('chat.channel.menu.edit.tabs.user.badge.banned')) }}</span>
				<q-toggle
					v-model="data.isBanned"
					checked-icon="dangerous"
					color="green"
					size="lg"
					:disable="!data.isAdmin"
				/>
			</div>
		</q-item-section>
	</q-item>
	<q-separator />
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';

interface usersOptionsInterface {
	id: number,
	isCreator: boolean,
	isAdmin: boolean,
	isMuted: boolean,
	isBanned: boolean
}

export default defineComponent({
	name: 'chat_dialog_edit_user_list',
	props: ['user', 'info'],
	setup (props, { emit })
	{
		const data: usersOptionsInterface = reactive({
			id: props.user.id,
			isCreator: props.info.isCreator,
			isAdmin: props.info.isAdmin,
			isMuted: props.info.isMuted,
			isBanned: props.info.isBanned
		});

		const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

		return {
			data,
			capitalize
		};
	}
});
</script>
