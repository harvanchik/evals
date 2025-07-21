import { redirect } from '@sveltejs/kit';
import { getXataClient } from '../../xata';
import type { LayoutServerLoad } from './$types';

const xata = getXataClient();

export const load: LayoutServerLoad = async ({ locals, depends }) => {
	depends('app:employees');
	if (!locals.user) {
		redirect(303, '/login');
	}

	const { orgCode } = locals;

	const employees = await (orgCode
		? xata.db.employees.filter({ org: orgCode }).getAll()
		: xata.db.employees.filter({ user: locals.user.username }).getAll());

	return {
		user: locals.user,
		employees
	};
};
