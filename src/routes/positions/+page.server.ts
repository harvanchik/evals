import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getXataClient } from '../../xata';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, '/');
	}
};

export const actions: Actions = {
	createPosition: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized', form: 'createPosition' });
		}
		const data = await request.formData();
		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const color = data.get('color') as string;

		if (!title) {
			return fail(400, { error: 'Title is required', form: 'createPosition' });
		}

		try {
			const xata = getXataClient();
			await xata.db.positions.create({
				title,
				description,
				color,
				user: locals.user.username
			});
		} catch (e) {
			return fail(500, { error: 'Failed to create position', form: 'createPosition' });
		}

		return { success: true, form: 'createPosition' };
	},
	updatePosition: async ({ request, locals, url }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { error: 'Position ID is required' });
		}

		const data = await request.formData();
		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const color = data.get('color') as string;

		if (!title) {
			return fail(400, { error: 'Title is required' });
		}

		try {
			const xata = getXataClient();
			await xata.db.positions.update(id, {
				title,
				description,
				color
			});
		} catch (e) {
			return fail(500, { error: 'Failed to update position' });
		}

		return { success: true };
	},
	deletePosition: async ({ locals, url }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { error: 'Position ID is required' });
		}

		try {
			const xata = getXataClient();
			await xata.db.positions.delete(id);
		} catch (e) {
			return fail(500, { error: 'Failed to delete position' });
		}

		return { success: true };
	}
};
