import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getXataClient } from '../../xata';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, '/');
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(303, '/');
		}

		const data = await request.formData();
		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const color = data.get('color') as string;

		if (!title) {
			return fail(400, { title, error: 'Title is required' });
		}

		const xata = getXataClient();
		await xata.db.positions.create({
			title,
			description,
			color,
			user: locals.user.username
		});

		return { success: true };
	}
};
