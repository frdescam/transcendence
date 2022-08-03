<template>
	<q-form
		method="post"
		@submit="passwordSubmit"
	>
		<q-input
			v-model="oldPassword"
			outlined
			label="Current Password"
			name="password"
			:type="isOldPswd ? 'password' : 'text'"
			class=""
			:rules="[(val) => !!val || 'Field is required']"
			ref="inputRef"
		>
			<template v-slot:append>
				<q-icon
					:name="isOldPswd ? 'visibility_off' : 'visibility'"
					class="cursor-pointer"
					@click="isOldPswd = !isOldPswd"
				/>
			</template>
		</q-input>
		<q-input
			v-model="newPassword"
			outlined
			label="New Password"
			name="password"
			:type="isNewPswd ? 'password' : 'text'"
			class=""
			:rules="[(val) => !!val || 'Field is required']"
			ref="inputRef"
		>
			<template v-slot:append>
				<q-icon
					:name="isNewPswd ? 'visibility_off' : 'visibility'"
					class="cursor-pointer"
					@click="isNewPswd = !isNewPswd"
				/>
			</template>
		</q-input>
		<q-btn type="submit" class="q-mt-md" label='Update' />
	</q-form>
</template>

<script>
import { ref, defineComponent } from 'vue';

export default defineComponent({
	setup ()
	{
		const newPassword = ref('');
		const oldPassword = ref('');
		const passwordSubmit = function ()
		{
			console.log(oldPassword.value, newPassword.value);
		};
		return {
			newPassword,
			oldPassword,
			isOldPswd: ref(true),
			isNewPswd: ref(true),
			passwordSubmit
		};
	}
});
</script>
