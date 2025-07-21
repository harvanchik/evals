import { getXataClient } from '../../../xata';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

const xata = getXataClient();

export const load: PageServerLoad = async ({ params, locals }) => {
	const { id } = params;
	const { user, orgCode } = locals;

	if (!user) {
		redirect(302, '/login');
	}

	const employee = await xata.db.employees.read(id);

	if (!employee) {
		error(404, 'Employee not found');
	}

	const entries = await (
		orgCode
			? xata.db.entries.filter({ 'employee.id': id, org: orgCode })
			: xata.db.entries.filter({ 'employee.id': id, user: user.username, $notExists: 'org' })
	)
		.sort('xata.createdAt', 'desc')
		.getMany();

	const tags = await (
		orgCode
			? xata.db.tags.filter({ org: orgCode })
			: xata.db.tags.filter({ user: user.username, $notExists: 'org' })
	).getAll();

	return { employee, entries, tags: tags.toSerializable() };
};

export const actions: Actions = {
	addEntry: async ({ request, params, locals }) => {
		const { id: employeeId } = params;
		const { user, orgCode } = locals;

		if (!user) {
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

		const entryData: any = {
			employee: employeeId,
			user: user.username,
			note,
			rating,
			tags
		};

		if (orgCode) {
			entryData.org = orgCode;
		}

		try {
			await xata.db.entries.create(entryData);
		} catch (e) {
			console.error(e);
			return fail(500, { error: 'Could not create entry.' });
		}

		return { success: true };
	}
};
