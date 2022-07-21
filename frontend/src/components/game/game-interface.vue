<script setup lang="ts">
import clsx from 'clsx';
import { AppFullscreen } from 'quasar';
import { ref, Ref } from 'vue';
import GameView from './game-view.vue';
import type { interfaceState } from './game-view.vue';

defineProps<{ party: string }>();

const self = ref<Ref | null>(null);
const pong = ref<Ref | null>(null);

function toggleFullscreen ()
{
	AppFullscreen
		.toggle(self.value)
		.then(() =>
		{
			pong.value?.resize();
			requestAnimationFrame(
				function ()
				{
					requestAnimationFrame(
						function ()
						{
							pong.value?.resize();
						}
					);
				}
			);
		});
}

function teamActionIcon (state: interfaceState): string | undefined
{
	if (state.can_join)
		return 'play_arrow';
	else if (state.spectator)
		return 'visibility';
	else
		return 'person';
}

function teamActionText (state: interfaceState): string
{
	if (state.can_join)
		return 'Join as player';
	else if (state.spectator)
		return 'You are spectator';
	else
		return 'You are playing';
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

			<game-view ref="pong" :party="party"></game-view>

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

				<q-btn-dropdown color="blue-grey-8" icon="input" label="Controls">
					<q-list>
						<q-item clickable dense active-class="bg-blue-1 text-blue-8" :disable="!pong.state.available_controls.wheel" :active="pong.state.controls.wheel" @click="pong.toggleControl('wheel')">
							<q-item-section side class="inherit_color">
								<q-icon name="mdi-mouse-move-down" />
							</q-item-section>
							<q-item-section>
								<q-item-label>Mouse Wheel</q-item-label>
							</q-item-section>
						</q-item>
						<q-item clickable dense active-class="bg-blue-1 text-blue-8" :disable="!pong.state.available_controls.keyboard" :active="pong.state.controls.keyboard" @click="pong.toggleControl('keyboard')">
							<q-item-section side class="inherit_color">
								<q-icon name="keyboard" />
							</q-item-section>
							<q-item-section>
								<q-item-label>Keyboard</q-item-label>
							</q-item-section>
						</q-item>
						<q-item clickable dense active-class="bg-blue-1 text-blue-8" :disable="!pong.state.available_controls.mouse" :active="pong.state.controls.mouse" @click="pong.toggleControl('mouse')">
							<q-item-section side class="inherit_color">
								<q-icon name="mdi-cursor-default" />
							</q-item-section>
							<q-item-section>
								<q-item-label>Cursor</q-item-label>
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

				<q-btn
					icon="accessibility"
					:color="pong && pong.state.accessibility ? 'amber-10' : 'black'"
					@click="pong.toggleAccessibility()"
				/>

				<q-space />

				<q-btn
					color="black"
					:icon="pong && teamActionIcon(pong.state)"
					:label="pong && teamActionText(pong.state)"
					:disable="pong && (!pong.state.can_join || pong.state.finish)"
					@click="pong.join()"
				/>

				<q-space />

				<q-btn
					color="green-7"
					:icon="pong && pong.state.paused ? 'play_arrow' : 'pause'"
					:label="pong && pong.state.paused ? 'Play' : 'Pause'"
					:disable="pong && (pong.state.spectator || pong.state.finish)"
					@click="pong.onClick()"
				/>

				<q-btn
					color="brown-7"
					icon-right="flag"
					label="Give up"
					:disable="pong && (pong.state.spectator || pong.state.finish)"
					@click="pong.admitDefeat()"
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
.inherit_color
{
	color: inherit;
}
</style>
