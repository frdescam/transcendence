<template>
	<q-page class="row no-wrap justify-between items-stretch content-stretch">
		<div class="col-3 channel">
			First column
		</div>
		<div class="col-6 chat">
			<form
				autocorrect="off"
				autocapitalize="off"
				autocomplete="off"
				spellcheck="true"
			>
				<q-editor
					placeholder="Write your message"
					ref="editorRef"
					max-height="15em"
					:definitions="definitions"
					:toolbar="[
						['bold', 'italic', 'strike', 'underline'],
						['undo', 'redo'],
						['image', 'send']
					]"
					v-model="editor"
				/>
			</form>
			<div class="message-list">
				<q-chat-message
					name="me"
					avatar="https://cdn.quasar.dev/img/avatar3.jpg"
					stamp="7 minutes ago"
					sent
					text-color="white"
					bg-color="primary"
				>
					<div>Hey there!</div>
					<div>Have you seen Quasar?
						<img src="https://cdn.quasar.dev/img/discord-omq.png" class="emoticon">
					</div>
				</q-chat-message>

				<q-chat-message
					name="Jane"
					avatar="https://cdn.quasar.dev/img/avatar5.jpg"
					bg-color="amber"
				>
					<q-spinner-dots size="2rem" />
				</q-chat-message>

				<q-chat-message
					name="Jane"
					avatar="https://cdn.quasar.dev/img/avatar5.jpg"
					bg-color="amber"
				>
					<q-spinner-dots size="2rem" />
				</q-chat-message>
				<q-chat-message
					name="Jane"
					avatar="https://cdn.quasar.dev/img/avatar5.jpg"
					bg-color="amber"
				>
					<q-spinner-dots size="2rem" />
				</q-chat-message>
				<q-chat-message
					name="Jane"
					avatar="https://cdn.quasar.dev/img/avatar5.jpg"
					bg-color="amber"
				>
					<q-spinner-dots size="2rem" />
				</q-chat-message>
				<q-chat-message
					name="Jane"
					avatar="https://cdn.quasar.dev/img/avatar5.jpg"
					bg-color="amber"
				>
					<q-spinner-dots size="2rem" />
				</q-chat-message>
				<q-chat-message
					name="Jane"
					avatar="https://cdn.quasar.dev/img/avatar5.jpg"
					bg-color="amber"
				>
					<q-spinner-dots size="2rem" />
				</q-chat-message>
				<q-chat-message
					name="Jane"
					avatar="https://cdn.quasar.dev/img/avatar5.jpg"
					bg-color="amber"
				>
					<q-spinner-dots size="2rem" />
				</q-chat-message>
				<q-chat-message
					name="Jane"
					avatar="https://cdn.quasar.dev/img/avatar5.jpg"
					bg-color="amber"
				>
					<q-spinner-dots size="2rem" />
				</q-chat-message>

			</div>
		</div>
		<div class="col-3 user">
			Third column
		</div>
	</q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
	name: 'chat-page',
	setup ()
	{
		const editor = ref('');
		return {
			editor,
			definitions: {
				image: {
					icon: 'image',
					tip: 'Insert image',
					handler: () =>
					{
						const input = document.createElement('input');
						input.type = 'file';
						input.accept = '.png, .jpg';
						let file;
						input.onchange = () =>
						{
							const files = Array.from(input.files as FileList);
							file = files[0];
							const reader = new FileReader();
							let dataUrl:string;
							reader.onloadend = () =>
							{
								dataUrl = String(reader.result);
								editor.value += `<img src="${dataUrl}" />`;
							};
							reader.readAsDataURL(file);
						};
						input.click();
					}
				},
				send: {
					icon: 'send',
					tip: 'Send message',
					handler: () =>
					{
						const value = editor.value;
						console.log(value, value.length);
					}
				}
			}
		};
	}
});
</script>

<style>
.channel {
	background-color: rgb(230, 230, 230);
}
.chat {
	display: inline-flex;
	flex-direction: column-reverse;
	height: calc(100vh - 50px) !important;
}
.chat .message-list {
	padding: .5em;
	overflow-x: auto;
}
.chat form img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.user {
	background-color: rgb(230, 230, 230);
}
.emoticon {
	vertical-align: middle;
	height: 2em;
	width: 2em;
}

</style>
