import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getXataClient } from '../../../xata';

export const actions: Actions = {
	reinstateEmployee: async ({ locals, url }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { error: 'Employee ID is required' });
		}

		const xata = getXataClient();
		try {
			const reinstatedEmployee = await xata.db.employees.update(id, {
				archived: false
			});
			return { success: true, reinstatedEmployee };
		} catch (e) {
			return fail(500, { error: 'Failed to reinstate employee' });
		}
	}
};
