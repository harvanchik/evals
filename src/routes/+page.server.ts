import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getXataClient } from '../xata';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		console.log('No user found, redirecting to login.');
		redirect(303, '/login');
	}

	console.log('Fetching dashboard data for user:', locals.user.username);
	const xata = getXataClient();

	try {
		const filter = { user: locals.user.username };
		console.log('Using filter to get employees for dashboard:', filter);
		const employees = await xata.db.employees.filter(filter).getAll();
		console.log(`Found ${employees.length} employees for dashboard.`);
		console.log('Dashboard employees data:', JSON.stringify(employees, null, 2));

		const performanceEntries = [];

		return { employees, performanceEntries };
	} catch (e) {
		console.error('Error fetching dashboard data:', e);
		return { employees: [], performanceEntries: [] };
	}
};
