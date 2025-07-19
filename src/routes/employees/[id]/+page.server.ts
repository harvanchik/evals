import { getXataClient } from '../../../xata.ts';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

const xata = getXataClient();

export const load: PageServerLoad = async ({ params, locals }) => {
	const { id } = params;

	if (!locals.user) {
		redirect(302, '/login');
	}

	const employee = await xata.db.employees.read(id);

	if (!employee) {
		error(404, 'Employee not found');
	}

	const entries = await xata.db.entries
		.filter({
			'employee.id': id,
			user: locals.user.username
		})
		.sort('xata.createdAt', 'desc')
		.getMany();

	const tags = await xata.db.tags.filter({ user: locals.user.username }).getAll();

	return { employee, entries, tags: tags.toSerializable() };
};

export const actions: Actions = {
	addEntry: async ({ request, params, locals }) => {
		const { id: employeeId } = params;

		if (!locals.user) {
			error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const note = formData.get('note') as string;
		const rating = parseFloat(formData.get('rating') as string);
		const tags = formData.getAll('tags') as string[];

		if (!note || note.trim().length === 0) {
			return fail(400, { note, missing: true });
		}

		if (isNaN(rating) || rating < 0 || rating > 5) {
			return fail(400, { rating, invalid: true });
		}

		try {
			await xata.db.entries.create({
				employee: employeeId,
				user: locals.user.username,
				note,
				rating,
				tags
			});
		} catch (e) {
			console.error(e);
			return fail(500, { error: 'Could not create entry.' });
		}

		return { success: true };
	}
};
