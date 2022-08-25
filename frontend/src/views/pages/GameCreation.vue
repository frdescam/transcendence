<template>
	<q-page class="row items-center justify-center">
		<div class="q-pa-xs shadow-box shadow-8">
			<q-btn-toggle v-model="roomType" toggle-color="primary" class="bg-blue-grey-1 q-ma-md" :options="[
				{ label: 'Join a room', value: 'join' },
				{ label: 'Create a room', value: 'create' },
			]" />
			<create-room v-if="roomType === 'create'"></create-room>
			<join-room v-else></join-room>
		</div>
	</q-page>
</template>

<script lang="ts">
import { ref } from 'vue';
import CreateRoom from 'src/components/gameCreationForm/CreateRoom.vue';
import JoinRoom from 'src/components/gameCreationForm/JoinRoom.vue';

export default {
	setup ()
	{
		const roomType = ref('join');
		return {
			roomType
		};
	},
	components: { CreateRoom, JoinRoom }
};
</script>
