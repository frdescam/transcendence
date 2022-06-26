<template>
	<div class="q-pa-md">
		<q-table
			class="my-sticky-virtscroll-table"
			virtual-scroll
			v-model:pagination="pagination"
			:rows-per-page-options="[0]"
			:virtual-scroll-sticky-size-start="48"
			row-key="rank"
			title="Leaderboard"
			:rows="rows"
			:columns="columns">
			<template v-slot:body-cell-picture="props">
				<q-td :props="props">
					<img src="image.url"/>
				</q-td>
			</template>
		</q-table>

	</div>
</template>

<script>
import { ref } from 'vue';
const columns = [
	{
		name: 'rank',
		label: 'RANK',
		field: 'rank',
		required: true,
		align: 'left',
		sortable: true
	},
	{
		name: 'picture',
		required: true,
		label: '',
		align: 'right',
		field: row => row.picture,
		sortable: true
	},
	{
		name: 'user',
		required: true,
		label: 'PLAYER',
		align: 'left',
		field: row => row.user,
		format: val => `${val}`,
		sortable: true
	},
	{
		name: 'ratio',
		label: 'RATIO',
		field: 'ratio',
		sortable: true,
		sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
	}
];

const seed = [
	{
		rank: '#1',
		user: 'Frozen Yogurt',
		picture: 'https://cdn.quasar.dev/img/boy-avatar.png',
		ratio: '1%'
	},
	{
		rank: '#2',
		user: 'Ice cream sandwich',
		picture: 'https://cdn.quasar.dev/img/boy-avatar.png',
		ratio: '1%'
	},
	{
		rank: '#3',
		user: 'Eclair',
		picture: 'https://cdn.quasar.dev/img/boy-avatar.png',
		ratio: '7%'
	},
	{
		rank: '#4',
		user: 'Cupcake',
		picture: 'https://cdn.quasar.dev/img/boy-avatar.png',
		ratio: '8%'
	},
	{
		rank: '#5',
		user: 'Gingerbread',
		picture: 'https://cdn.quasar.dev/img/boy-avatar.png',
		ratio: '16%'
	},
	{
		rank: '#6',
		user: 'Jelly bean',
		picture: 'https://cdn.quasar.dev/img/boy-avatar.png',
		ratio: '0%'
	},
	{
		rank: '#7',
		user: 'Lollipop',
		picture: 'https://cdn.quasar.dev/img/boy-avatar.png',
		ratio: '2%'
	},
	{
		rank: '#8',
		user: 'Honeycomb',
		picture: 'https://cdn.quasar.dev/img/boy-avatar.png',
		ratio: '45%'
	},
	{
		rank: '#9',
		user: 'Donut',
		picture: 'https://cdn.quasar.dev/img/boy-avatar.png',
		ratio: '22%'
	},
	{
		rank: '#10',
		user: 'KitKat',
		picture: 'https://cdn.quasar.dev/img/boy-avatar.png',
		ratio: '6%'
	}
];

// we generate lots of rows here
let rows = [];
for (let i = 0; i < 1000; i++)
	rows = rows.concat(seed.slice(0).map(r => ({ ...r })));
rows.forEach((row, index) =>
{
	row.index = index;
});

export default {
	name: 'LeaderboardPage',
	setup ()
	{
		return {
			columns,
			rows,

			pagination: ref({
				rowsPerPage: 50
			})
		};
	}
};
</script>

<style lang="sass">
.my-sticky-virtscroll-table
  /* height or max-height is important */
  //height: 410px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
  background-color: #fff

  thead tr th
  position: sticky
  z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
  /* height of all previous header rows */
  top: 48px
  thead tr:first-child th
  top: 0
</style>
