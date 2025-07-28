import { getXataClient } from '../../xata';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

const xata = getXataClient();

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return {
			positions: []
		};
	}

	const { orgCode } = locals;

	const positions = await (orgCode
		? xata.db.positions.filter({ org: orgCode }).getAll()
		: xata.db.positions.filter({ user: locals.user.username, $notExists: 'org' }).getAll());

	return {
		positions
	};
};

export const actions: Actions = {
	createPosition: async ({ request, locals }) => {
		if (!locals.isAdmin) {
			return fail(401, { message: 'Unauthorized' });
		}
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const color = formData.get('color') as string;
		const { user, orgCode } = locals;

		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const positionData: any = {
			title,
			description,
			color,
			user: user.username
		};

		if (orgCode) {
			positionData.org = orgCode;
		}

		const newPosition = await xata.db.positions.create(positionData);

		return {
			newPosition
		};
	},
	updatePosition: async ({ request, locals, url }) => {
		if (!locals.isAdmin) {
			return fail(401, { message: 'Unauthorized' });
		}
		const { user } = locals;
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const id = url.searchParams.get('id');
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const color = formData.get('color') as string;

		if (!id) {
			return fail(400, { error: 'Position ID is required' });
		}

		if (!title) {
			return fail(400, { error: 'Title is required' });
		}

		const updatedPosition = await xata.db.positions.update(id, {
			title,
			description,
			color
		});

		return {
			updatedPosition
		};
	},
	deletePosition: async ({ locals, url }) => {
		if (!locals.isAdmin) {
			return fail(401, { message: 'Unauthorized' });
		}
		const { user } = locals;
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { error: 'Position ID is required' });
		}

		try {
			await xata.db.positions.delete(id);
		} catch (e) {
			return fail(500, { error: 'Failed to delete position' });
		}

		return { success: true };
	}
};
