<script lang="ts">
export default {
	name: 'user-status-page'
};
</script>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import UserStatus from '../../components/userstatus/userstatus-page.vue';

const route = useRoute();
const { userId } = route.params;
</script>

<template>
	<q-page class="full-width row wrap justify-center">
		<div class="col-10 col-xl-8 col-lg-10 col-md-12 col-sm-12 col-xs-12">
			<user-status :userId="parseInt(userId as string)"/>
		</div>
	</q-page>
</template>

<style scoped>
</style>
