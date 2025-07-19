import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getXataClient } from '../../xata';

export const actions: Actions = {
	createTag: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(303, '/');
		}

		const data = await request.formData();
		const name = data.get('name') as string;
		const description = data.get('description') as string;
		const color = data.get('color') as string;

		if (!name) {
			return fail(400, { error: 'Name is required' });
		}

		try {
			const xata = getXataClient();
			await xata.db.tags.create({
				name,
				description,
				color,
				user: locals.user.username
			});
		} catch (e) {
			return fail(500, { error: 'Failed to create tag' });
		}

		return { success: true };
	},
	updateTag: async ({ request, locals, url }) => {
		if (!locals.user) {
			redirect(303, '/');
		}

		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { error: 'Tag ID is required' });
		}

		const data = await request.formData();
		const name = data.get('name') as string;
		const description = data.get('description') as string;
		const color = data.get('color') as string;

		if (!name) {
			return fail(400, { error: 'Name is required' });
		}

		try {
			const xata = getXataClient();
			await xata.db.tags.update(id, {
				name,
				description,
				color
			});
		} catch (e) {
			return fail(500, { error: 'Failed to update tag' });
		}

		return { success: true };
	},
	deleteTag: async ({ locals, url }) => {
		if (!locals.user) {
			redirect(303, '/');
		}

		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { error: 'Tag ID is required' });
		}

		try {
			const xata = getXataClient();
			await xata.db.tags.delete(id);
		} catch (e) {
			return fail(500, { error: 'Failed to delete tag' });
		}

		return { success: true };
	}
};
