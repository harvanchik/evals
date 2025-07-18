import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getXataClient } from '../../xata';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, '/login');
	}

	const xata = getXataClient();
	const employees = await xata.db.employees.filter({ user: locals.user.username }).getAll();

	return { employees };
};
