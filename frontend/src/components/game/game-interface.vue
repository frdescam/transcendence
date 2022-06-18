<script setup lang="ts">
import clsx from 'clsx';
import { AppFullscreen } from 'quasar';
import { ref, Ref } from 'vue';
import GameView from './game-view.vue';

defineProps<{ userId: string, party: string }>();

const self = ref<Ref | null>(null);
const pong = ref<Ref | null>(null);

function toggleFullscreen ()
{
	AppFullscreen.toggle(self.value);
}

</script>

<template>
	<div ref="self">
		<q-card
			:class="clsx({
				'bg-blue-grey-1': !AppFullscreen.isActive,
				'column': AppFullscreen.isActive,
				'fill_screen': AppFullscreen.isActive,
			})"
			:dark="AppFullscreen.isActive"
		>

			<game-view ref="pong" :userId="userId" :party="party"></game-view>

			<q-card-actions
				:class="AppFullscreen.isActive && 'col col-auto'"
			>

				<q-btn-dropdown color="yellow-10" icon="tune" label="Graphics" auto-close>
					<q-list>
						<q-item clickable @click="pong.setQuality(0)" dense>
							<q-item-section>
								<q-item-label>Minimum</q-item-label>
							</q-item-section>
						</q-item>
						<q-item clickable @click="pong.setQuality(1)" dense>
							<q-item-section>
								<q-item-label>Bas</q-item-label>
							</q-item-section>
						</q-item>
						<q-item clickable @click="pong.setQuality(2)" dense>
							<q-item-section>
								<q-item-label>Moyen</q-item-label>
							</q-item-section>
						</q-item>
						<q-item clickable @click="pong.setQuality(3)" dense>
							<q-item-section>
								<q-item-label>Bon</q-item-label>
							</q-item-section>
						</q-item>
						<q-item clickable @click="pong.setQuality(4)" dense>
							<q-item-section>
								<q-item-label>Haut</q-item-label>
							</q-item-section>
						</q-item>
						<q-item clickable @click="pong.setQuality(5)" dense>
							<q-item-section>
								<q-item-label>Ultra</q-item-label>
							</q-item-section>
						</q-item>
					</q-list>
				</q-btn-dropdown>

				<q-btn
					color="blue-7"
					:icon="AppFullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
					:label="AppFullscreen.isActive ? 'Window' : 'Fullscreen'"
					@click="toggleFullscreen"
				/>

				<q-space />

				<q-btn
					color="green-7"
					:icon="pong && pong.state.paused ? 'play_arrow' : 'pause'"
					:label="pong && pong.state.paused ? 'Play' : 'Pause'"
					:disable="pong && !pong.state.ready"
					@click="pong.togglePause()"
				/>

				<q-btn
					color="brown-7"
					icon-right="flag"
					label="Admit defeat"
					:disable="pong && !pong.state.ready"
				/>

			</q-card-actions>

		</q-card>
	</div>
</template>

<style scoped>
.fill_screen
{
	height: 100%;
}
</style>
