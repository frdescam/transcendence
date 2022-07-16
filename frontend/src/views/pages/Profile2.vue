<template>
	<div class="q-pa-none">
		<div class="column" style="background-image: url(user_profile_background.png); background-position: center">
			<div class="q-pa-md full-width row items-center">
				<div class="q-my-lg row full-height items-center justify-around col-md-3 col-12">
					<q-avatar class="q-my-auto" size=150px>
						<img src='https://cdn.quasar.dev/img/boy-avatar.png'>
						<q-badge class="absolute-bottom-right" style="width: 30px; height: 30px" color="light-green-14" rounded></q-badge>
						<q-tooltip>Online</q-tooltip>
					</q-avatar>
				</div>
				<div class="col-md-9 col-12">
					<div class="fit column q-pa-sm" style="background: rgba(0, 0, 0, 0.4); border-radius: 10px">
						<div class="row col-8 items-center">
							<!-- Yes I know this is awful but it's the cleanest way to do ... quasar stinks -->
							<div class="gt-sm row col-12 col-md-5">
								<p style="font-size: 3em; color: #eee; width: 200px">Frdescam</p>
								<p class="text-weight-bold" style="font-size: 3em; color: #eee; width: 75px">#42</p>
							</div>
							<div class="lt-md justify-center row col-12 col-md-5">
								<p style="font-size: 3em; color: #eee; width: 200px">Frdescam</p>
								<p class="text-weight-bold" style="font-size: 3em; color: #eee; width: 75px">#42</p>
							</div>
							<q-badge class="q-mx-auto self-end q-mb-md q-pa-md" style="font-size: 3em; color: #eee; height: 50px; background: rgba(0, 0, 0, 0.4); border-radius: 15px">Level 42</q-badge>
							<div class="col-12 col-md-2 gt-sm text-right" style="font-size: 1.5em; color: #eee;">Ratio : 42%</div>
							<div class="col-12 col-md-2 lt-md text-center" style="font-size: 1.5em; color: #eee;">Ratio : 42%</div>
						</div>
						<div class="row justify-between col-2 items-end">
							<p style="color: #eee;" class="q-mb-none">Next level :</p>
							<p style="color: #eee;" class="q-mb-none">42 / 100 XP</p>
						</div>
						<div class="col-2">
							<q-linear-progress stripe rounded class="q-mt-sm" size="20px" value="0.42" color="blue"/>
						</div>
					</div>
				</div>
			</div>
			<q-item class="full-width row justify-around">
				<q-btn style="background: rgba(0, 0, 0, 0.4); color: #eee;" label="add friend"/>
				<q-btn style="background: rgba(0, 0, 0, 0.4); color: #eee;" label="send a message"/>
				<q-btn style="background: rgba(0, 0, 0, 0.4); color: #eee;" label="block user"/>
			</q-item>
		</div>
		<div style="height: 5000px">
		</div>
	</div>
</template>
<script>
export default {
	name: 'LeaderboardPage',
	setup ()
	{
		return 3;
	}
};
</script>
