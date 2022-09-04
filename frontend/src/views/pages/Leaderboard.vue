<template>
	<q-table
		:title="capitalize($t('menu.leaderboard'))"
		:rows="rows"
		:columns="[
			{
				name: 'rank',
				label: $t('leaderboard.rank').toUpperCase(),
				field: 'rank',
				required: true,
				align: 'left',
				format: (val: number) => `#${val}`,
				style: 'width: 5%'
			},
			{
				name: 'avatar',
				label: '',
				field: 'avatar',
				reqired: true,
				align: 'right',
				style: 'width: 10%'
			},
			{
				name: 'pseudo',
				field: 'pseudo',
				required: true,
				label: $t('leaderboard.player').toUpperCase(),
				align: 'left'
			},
			{
				name: 'ratio',
				label: $t('leaderboard.ratio').toUpperCase(),
				field: 'ratio',
				required: true,
				align: 'left',
				style: 'width: 10%'
			},
			{
				name: 'level',
				label: $t('leaderboard.level').toUpperCase(),
				field: 'xp',
				required: true,
				align: 'left',
				style: 'width: 10%'
			}
		]"
		row-key="rank"
		v-model:pagination="pagination"
		:loading="loading"
		:filter="filter"
		@request="refreshData"
		@row-click="onRowClick"
		binary-state-sort
	>
		<template v-slot:top-right>
			<q-toggle class="q-mr-lg"
				:label="capitalize($t('leaderboard.friends'))"
				color="blue"
				@update:model-value="onFriendsOnlyChanged"
				v-model="friendsOnly"
			/>
			<q-input borderless dense debounce="300" v-model="filter" :placeholder="capitalize($t('leaderboard.search'))">
				<template v-slot:append>
					<q-icon name="search" />
				</template>
			</q-input>
		</template>
		<template #body-cell-avatar="props">
			<q-td :props="props">
				<q-avatar :props="props">
					<img :src=props.value v-on:error="imageError" />
				</q-avatar>
			</q-td>
    </template>
	</q-table>
</template>

<script lang="ts">
import { inject, ref, onMounted, computed } from 'vue';
import { AxiosInstance } from 'axios';
import { Capitalize } from 'src/boot/libs';
import { useRouter } from 'vue-router';

export default {
	name: 'LeaderboardPage',
	setup ()
	{
		const api: AxiosInstance = inject('api') as AxiosInstance;
		const capitalize: Capitalize = inject('capitalize') as Capitalize;

		const friendsOnly = ref(false);
		const router = useRouter();
		const rows = ref([]);
		const filter = ref('');
		const loading = ref(false);
		const pagination = ref({
			sortBy: 'rank',
			descending: false,
			page: 1,
			rowsPerPage: 10,
			rowsNumber: 0
		});

		const imageError = (e: Event) =>
		{
			const target = e.target as HTMLImageElement;
			if (target)
				target.src = 'imgs/chat/default.webp';
		};

		async function fetchFromServer (friendsOnly, startRow, count, filter)
		{
			const res = await api.get('/leaderboard/getRows', {
				params: {
					friendsOnly,
					startRow,
					count,
					filter
				}
			});
			return res.data;
		}

		async function refreshData (props, localFriendsOnly = friendsOnly.value)
		{
			const { page, rowsPerPage, sortBy, descending } = props.pagination;
			const filter = props.filter;

			loading.value = true;

			const fetchCount = rowsPerPage;
			const startRow = (page - 1) * rowsPerPage;
			const returnedData = await fetchFromServer(localFriendsOnly, startRow, fetchCount, filter);
			pagination.value.rowsNumber = returnedData.totalRowsNumber;
			rows.value.splice(0, rows.value.length, ...returnedData.rows);

			pagination.value.page = page;
			pagination.value.rowsPerPage = rowsPerPage;
			pagination.value.sortBy = sortBy;
			pagination.value.descending = descending;

			loading.value = false;
		}

		onMounted(() =>
		{
			refreshData({
				pagination: pagination.value,
				filter: undefined
			});
		});

		async function onFriendsOnlyChanged (value)
		{
			refreshData(
				{
					pagination: pagination.value,
					filter: filter.value
				},
				value
			);
		}

		async function onRowClick (evt, row)
		{
			router.push('/profile/' + row.id);
		}

		return {
			friendsOnly,
			filter,
			loading,
			pagination,
			rows,
			pagesNumber: computed(() => Math.ceil(rows.value.length / pagination.value.rowsPerPage)),

			imageError,
			refreshData,
			onRowClick,
			onFriendsOnlyChanged,

			capitalize
		};
	}
};
</script>
