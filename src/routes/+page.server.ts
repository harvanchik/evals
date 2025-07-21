import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getXataClient } from '../xata';

export const load: PageServerLoad = async ({ locals }) => {
	const { user, orgCode } = locals;
	if (!user) {
		redirect(303, '/login');
	}

	const xata = getXataClient();
	const filter = orgCode ? { org: orgCode } : { user: user.username };
	const performanceEntries = await xata.db.entries.filter(filter).getAll();

	return { performanceEntries };
};
