<script setup lang="ts">
import clsx from 'clsx';
import { AppFullscreen } from 'quasar';
import { ref, inject, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Capitalize } from 'src/boot/libs';
import GameView from './game-view.vue';
import ControlItem from './game-interface-control-item.vue';
import type { interfaceState } from './game-view.vue';

defineProps<{ party: string }>();

const { t } = useI18n();
const capitalize: Capitalize = inject('capitalize') as Capitalize;
const self = ref<Ref | null>(null);
const pong = ref<Ref | null>(null);

const qualityLevelsLabels = [
	capitalize(t('game.gameInterface.quality.minimum')),
	capitalize(t('game.gameInterface.quality.low')),
	capitalize(t('game.gameInterface.quality.average')),
	capitalize(t('game.gameInterface.quality.good')),
	capitalize(t('game.gameInterface.quality.high')),
	capitalize(t('game.gameInterface.quality.ultra'))
];

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
					pong.value?.resize();
					requestAnimationFrame(
						function ()
						{
							setTimeout(pong.value?.resize);
						}
					);
				}
			);
		});
}

function teamActionIcon (state: interfaceState): string | undefined
{
	if (state.can_join)
		return 'login';
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

function compactTeamActionText (state: interfaceState): string
{
	if (state.can_join)
		return 'Join as player';
	else if (state.spectator)
		return 'Spectating';
	else
		return 'Playing';
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

				<q-btn-dropdown
          menu-anchor="bottom start"
          menu-self="top start"
          color="blue-grey-8"
          icon="settings"
          :dense="$q.screen.lt.sm"
        >

					<q-list>
						<q-item clickable dense>

							<q-item-section side>
								<q-icon name="input" />
							</q-item-section>
							<q-item-section>{{ capitalize($t('game.gameInterface.controls')) }}</q-item-section>
							<q-item-section side>
								<q-icon name="keyboard_arrow_right" />
							</q-item-section>

              <q-menu anchor="top end" self="top start">
                <q-list>
                  <ControlItem
                    :state="pong ? pong.state : null"
                    :action="pong.toggleControl"
										:label="$q.screen.lt.sm ? capitalize($t('game.gameInterface.wheel')): capitalize($t('game.gameInterface.mouse'))"
                    controlName="wheel"
                    icon="mdi-mouse-move-down"
                  />
                  <ControlItem
                    :state="pong ? pong.state : null"
                    :action="pong.toggleControl"
                    :label="capitalize($t('game.gameInterface.keyboard'))"
                    controlName="keyboard"
                    icon="keyboard"
                  />
                  <ControlItem
                    :state="pong ? pong.state : null"
                    :action="pong.toggleControl"
                    :label="capitalize($t('game.gameInterface.cursor'))"
                    controlName="mouse"
                    icon="mdi-cursor-default"
                  />
                </q-list>
              </q-menu>

						</q-item>

						<q-item clickable dense>

							<q-item-section side>
								<q-icon name="tune" />
							</q-item-section>
							<q-item-section>{{ capitalize($t('game.gameInterface.graphics')) }}</q-item-section>
							<q-item-section side>
								<q-icon name="keyboard_arrow_right" />
							</q-item-section>

              <q-menu anchor="top end" self="top start" auto-close>
                <q-list>

                  <q-item
                    v-for='(qualityLabel, index) in qualityLevelsLabels'
                    v-bind:key="index"
                    dense
                    clickable
                    active-class="bg-blue-1 text-blue-8"
                    @click="pong.setQuality(index)"
                    :active="pong.state.graphics == index"
                  >
                    <q-item-section>
                      <q-item-label>{{qualityLabel}}</q-item-label>
                    </q-item-section>
                  </q-item>

                </q-list>
              </q-menu>

						</q-item>

            <q-item
              dense
              class="lt-sm"
              active-class="bg-amber-10 text-black"
              v-close-popup
              clickable
              :active="pong && pong.state.accessibility"
              @click="pong.toggleAccessibility()"
            >
							<q-item-section side>
								<q-icon name="accessibility" />
							</q-item-section>
							<q-item-section>Accessibility</q-item-section>
            </q-item>

					</q-list>

				</q-btn-dropdown>

				<q-btn
					color="blue-7"
					:icon="AppFullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
          :dense="$q.screen.lt.sm"
					@click="toggleFullscreen"
				>
          <q-tooltip
						transition-duration="150"
						anchor="top middle"
						self="bottom middle"
					>
						{{
							AppFullscreen.isActive ?
							capitalize($t('game.gameInterface.window')) :
							capitalize($t('game.gameInterface.fullscreen'))
						}}
					</q-tooltip>
        </q-btn>

				<q-btn
					icon="accessibility"
					:color="(pong && pong.state.accessibility) ? 'amber-10' : 'black'"
					@click="pong.toggleAccessibility()"
          class="gt-xs"
				>
          <q-tooltip transition-duration="150" anchor="top middle" self="bottom middle">
						{{ capitalize($t('game.gameInterface.accessibility')) }}
					</q-tooltip>
        </q-btn>

				<q-space />

				<q-btn
					color="black"
					:icon="pong && $q.screen.gt.sm && teamActionIcon(pong.state) || undefined"
					:label="pong && ($q.screen.lt.sm ? compactTeamActionText(pong.state) : teamActionText(pong.state))"
          :dense="$q.screen.lt.sm"
					:disable="pong && (!pong.state.can_join || pong.state.finish)"
					@click="pong.join()"
				/>

				<q-space />

				<q-btn
					color="green-7"
					:icon="pong && pong.state.paused ? 'play_arrow' : 'pause'"
					:label="pong && $q.screen.gt.sm && (pong.state.paused ? capitalize($t('game.gameInterface.play')) : capitalize($t('game.gameInterface.pause'))) || undefined"
          :dense="$q.screen.lt.sm"
					:disable="pong && (pong.state.spectator || pong.state.lobby)"
					@click="pong.onClick()"
				/>

				<q-btn
					color="brown-7"
					icon-right="flag"
					:label="$q.screen.gt.xs ? capitalize($t('game.gameInterface.give')) : undefined"
          :dense="$q.screen.lt.sm"
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
</style>
