<template>
	<div class="q-pa-md">
		<q-table
			title="Leaderboard"
			:rows="rows"
			:columns="columns"
			row-key="rank"
			v-model:pagination="pagination"
			:loading="loading"
			:filter="filter"
			@request="onRequest"
			@row-click="onRowClick"
			binary-state-sort
		>
			<template v-slot:top-right>
				<q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
					<template v-slot:append>
						<q-icon name="search" />
					</template>
				</q-input>
			</template>
			<template #body-cell-avatar="props">
				<q-td :props="props">
					<q-avatar :props="props">
						<img :src=props.value>
					</q-avatar>
				</q-td>
		</template>
		</q-table>
	</div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'boot/axios';

const columns = [
	{
		name: 'rank',
		label: 'RANK',
		field: 'rank',
		required: true,
		align: 'left',
		format: (val) => `#${val}`,
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
		label: 'PLAYER',
		align: 'left'
	},
	{
		name: 'ratio',
		label: 'RATIO',
		field: 'ratio',
		required: true,
		align: 'left',
		style: 'width: 10%'
	}
];

export default {
	name: 'LeaderboardPage',
	setup ()
	{
		const router = useRouter();
		const rows = ref([]);
		const filter = ref('');
		const loading = ref(false);
		const pagination = ref({
			sortBy: 'rank',
			descending: false,
			page: 1,
			rowsPerPage: 4,
			rowsNumber: 0
		});

		async function fetchFromServer (startRow, count, filter, sortBy, descending)
		{
			const res = await api.get('/leaderboard/getRows', {
				params: {
					startRow,
					count,
					filter,
					sortBy,
					descending
				}
			});
			return res.data;
		}

		async function onRequest (props)
		{
			const { page, rowsPerPage, sortBy, descending } = props.pagination;
			const filter = props.filter;

			loading.value = true;

			const fetchCount = rowsPerPage;
			const startRow = (page - 1) * rowsPerPage;
			const returnedData = await fetchFromServer(startRow, fetchCount, filter, sortBy, descending);
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
			onRequest({
				pagination: pagination.value,
				filter: undefined
			});
		});

		async function onRowClick (evt, row)
		{
			router.push('/profile/' + row.pseudo);
		}

		return {
			filter,
			loading,
			pagination,
			columns,
			rows,
			pagesNumber: computed(() => Math.ceil(rows.value.length / pagination.value.rowsPerPage)),

			onRequest,
			onRowClick
		};
	}
};
</script>
