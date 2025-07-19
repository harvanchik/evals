import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getXataClient } from '../../../xata';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(303, '/');
		}

		const formData = await request.formData();
		const csvData = formData.get('csvData') as string;

		const xata = getXataClient();
		const positions = await xata.db.positions
			.filter({ user: locals.user.username })
			.select(['title'])
			.getAll();
		const existingPositions = positions.map((p) => p.title?.toLowerCase());

		const rows = csvData.trim().split('\n');
		const newEmployees = [];
		const errors: string[] = [];

		rows.forEach((row, index) => {
			const [first_name, last_name, position] = row.split(',').map((item) => item.trim());

			if (!first_name || !last_name || !position) {
				errors.push(
					`Row ${
						index + 1
					}: Missing required fields (first_name, last_name, position). Row data: "${row}"`
				);
				return;
			}

			if (!existingPositions.includes(position.toLowerCase())) {
				errors.push(`Row ${index + 1}: Position "${position}" does not exist. Row data: "${row}"`);
				return;
			}

			newEmployees.push({
				first_name,
				last_name,
				position,
				archived: false,
				user: locals.user?.username
			});
		});

		if (errors.length > 0) {
			return fail(400, { errors, success: false });
		}

		if (newEmployees.length > 0) {
			try {
				await xata.db.employees.create(newEmployees);
			} catch (e) {
				return fail(500, {
					errors: ['An error occurred while importing employees.'],
					success: false
				});
			}
		}

		redirect(303, '/employees');
	}
};
