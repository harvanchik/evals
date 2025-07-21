import { getXataClient } from '../../xata';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

const xata = getXataClient();

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return {
			tags: []
		};
	}

	const { orgCode } = locals;

	const tags = await (orgCode
		? xata.db.tags.filter({ org: orgCode }).getAll()
		: xata.db.tags.filter({ user: locals.user.username, $notExists: 'org' }).getAll());

	return {
		tags
	};
};

export const actions: Actions = {
	createTag: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const color = formData.get('color') as string;
		const { user, orgCode } = locals;

		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const tagData: any = {
			name,
			description,
			color,
			user: user.username
		};

		if (orgCode) {
			tagData.org = orgCode;
		}

		const newTag = await xata.db.tags.create(tagData);

		return {
			newTag
		};
	},
	updateTag: async ({ request, locals, url }) => {
		const { user } = locals;
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const id = url.searchParams.get('id');
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const color = formData.get('color') as string;

		if (!id) {
			return fail(400, { error: 'Tag ID is required' });
		}

		if (!name) {
			return fail(400, { error: 'Name is required' });
		}

		const updatedTag = await xata.db.tags.update(id, {
			name,
			description,
			color
		});

		return {
			updatedTag
		};
	},
	deleteTag: async ({ locals, url }) => {
		const { user } = locals;
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { error: 'Tag ID is required' });
		}

		try {
			await xata.db.tags.delete(id);
		} catch (e) {
			return fail(500, { error: 'Failed to delete tag' });
		}

		return { success: true };
	}
};
