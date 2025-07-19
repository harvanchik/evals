import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getXataClient } from '../../xata';

export const actions: Actions = {
	createEmployee: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(303, '/');
		}

		const data = await request.formData();
		const first_name = data.get('first_name') as string;
		const last_name = data.get('last_name') as string;
		const nickname = data.get('nickname') as string;
		const position = data.get('position') as string;

		if (!first_name || !last_name || !position) {
			return fail(400, {
				error: 'Missing required fields',
				form: 'createEmployee'
			});
		}

		try {
			const xata = getXataClient();
			await xata.db.employees.create({
				first_name,
				last_name,
				nickname,
				position,
				user: locals.user.username,
				archived: false
			});
		} catch (e) {
			return fail(500, {
				error: 'Failed to create employee',
				form: 'createEmployee'
			});
		}

		return { success: true, form: 'createEmployee' };
	},

	updateEmployee: async ({ request, locals, url }) => {
		if (!locals.user) {
			redirect(303, '/');
		}

		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { error: 'Employee ID is required' });
		}

		const data = await request.formData();
		const first_name = data.get('first_name') as string;
		const last_name = data.get('last_name') as string;
		const nickname = data.get('nickname') as string;
		const position = data.get('position') as string;

		if (!first_name || !last_name || !position) {
			return fail(400, { error: 'Missing required fields' });
		}

		try {
			const xata = getXataClient();
			await xata.db.employees.update(id, {
				first_name,
				last_name,
				nickname,
				position
			});
		} catch (e) {
			return fail(500, { error: 'Failed to update employee' });
		}

		return { success: true };
	},

	archiveEmployee: async ({ locals, url }) => {
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
				archived: true
			});
		} catch (e) {
			return fail(500, { error: 'Failed to archive employee' });
		}

		return { success: true };
	}
};
