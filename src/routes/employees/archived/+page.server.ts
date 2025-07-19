import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getXataClient } from '../../../xata';

export const actions: Actions = {
	reinstateEmployee: async ({ locals, url }) => {
		if (!locals.user) {
			redirect(303, '/');
		}

		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { error: 'Employee ID is required' });
		}

		try {
			const xata = getXataClient();
			await xata.db.employees.update(id, {
				archived: false
			});
		} catch (e) {
			return fail(500, { error: 'Failed to reinstate employee' });
		}

		return { success: true };
	}
};
