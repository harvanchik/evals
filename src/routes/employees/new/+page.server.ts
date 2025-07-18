import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getXataClient } from '../../../xata';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(303, '/login');
		}

		const data = await request.formData();
		const firstName = data.get('firstName') as string;
		const lastName = data.get('lastName') as string;
		const nickname = data.get('nickname') as string;
		const position = data.get('position') as string;

		if (!firstName || !position) {
			return fail(400, {
				error: 'First name and position are required.'
			});
		}

		const xata = getXataClient();

		await xata.db.employees.create({
			first_name: firstName,
			last_name: lastName || undefined,
			nickname: nickname || undefined,
			position: position,
			archived: false,
			user: locals.user.username
		});

		redirect(303, '/employees');
	}
};
