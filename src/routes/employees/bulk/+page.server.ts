import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getXataClient } from '../../../xata';

type EmployeeCreateData = {
	first_name: string;
	last_name: string;
	position: string;
	archived: boolean;
	user: string;
	org?: string;
	nickname?: string;
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { user, orgCode } = locals;
		if (!user) {
			redirect(303, '/');
		}

		const formData = await request.formData();
		const csvData = formData.get('csvData') as string;

		const xata = getXataClient();

		const filter = orgCode ? { org: orgCode } : { user: user.username, $notExists: 'org' };
		const positions = await xata.db.positions.filter(filter).select(['title']).getAll();

		const existingPositions = positions.map((p) => p.title?.toLowerCase());

		const rows = csvData.trim().split('\n');
		const newEmployees: EmployeeCreateData[] = [];
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

			const employeeData: EmployeeCreateData = {
				first_name,
				last_name,
				position,
				archived: false,
				user: user.username
			};

			if (orgCode) {
				employeeData.org = orgCode;
			}

			newEmployees.push(employeeData);
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
