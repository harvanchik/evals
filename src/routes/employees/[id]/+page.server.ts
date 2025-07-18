import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getXataClient } from '../../../xata';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		redirect(303, '/login');
	}

	const xata = getXataClient();
	const employee = await xata.db.employees
		.filter({ id: params.id, user: locals.user.id })
		.getFirst();

	if (!employee) {
		error(404, 'Employee not found');
	}

	// NOTE: PerformanceEntries do not exist in Xata yet.
	const performanceEntries = [];

	return { employee, performanceEntries };
};
