import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getXataClient } from '../xata';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, '/login');
	}

	const xata = getXataClient();
	const employees = await xata.db.employees.filter({ user: locals.user.username }).getAll();

	const performanceEntries = [];

	return { employees, performanceEntries };
};
