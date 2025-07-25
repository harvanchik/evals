import { getXataClient } from '../../xata';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import type { EmployeesRecord } from '../../xata';

const xata = getXataClient();

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { user, orgCode } = locals;
	if (!user) {
		return { employees: [] };
	}
	const { employees } = (await parent()) as { employees: EmployeesRecord[] };

	const activeEmployees = employees.filter((emp) => emp.archived !== true);

	const baseFilter = orgCode ? { org: orgCode } : { user: user.username, $notExists: 'org' };

	const performanceEntries = await xata.db.entries
		.select(['*'])
		.filter({ ...baseFilter, 'employee.archived': false })
		.getAll();

	const employeesWithStats = activeEmployees.map((employee) => {
		const entriesForEmployee = performanceEntries.filter(
			(entry) => entry.employee?.id === employee.id
		);
		const ratings = entriesForEmployee
			.map((e) => e.rating)
			.filter((r): r is number => typeof r === 'number');

		const averageRating =
			ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
		return {
			...employee.toSerializable(),
			totalEntries: entriesForEmployee.length,
			avgRating: averageRating
		};
	});

	return {
		employees: employeesWithStats
	};
};

export const actions: Actions = {
	createEmployee: async ({ request, locals }) => {
		const formData = await request.formData();
		const firstName = formData.get('first_name') as string;
		const lastName = formData.get('last_name') as string;
		const nickname = formData.get('nickname') as string;
		const position = formData.get('position') as string;
		const { user, orgCode } = locals;

		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const employeeData: any = {
			first_name: firstName,
			last_name: lastName,
			nickname,
			position,
			user: user.username
		};

		if (orgCode) {
			employeeData.org = orgCode;
		}

		const newEmployee = await xata.db.employees.create(employeeData);

		return {
			newEmployee: newEmployee.toSerializable()
		};
	},
	updateEmployee: async ({ request, locals, url }) => {
		const { user } = locals;
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const id = url.searchParams.get('id');
		const formData = await request.formData();
		const firstName = formData.get('first_name') as string;
		const lastName = formData.get('last_name') as string;
		const nickname = formData.get('nickname') as string;
		const position = formData.get('position') as string;

		if (!id) {
			return fail(400, { error: 'Employee ID is required' });
		}

		if (!firstName || !lastName || !position) {
			return fail(400, { error: 'Missing required fields' });
		}

		const updatedEmployee = await xata.db.employees.update(id, {
			first_name: firstName,
			last_name: lastName,
			nickname,
			position
		});

		return {
			updatedEmployee
		};
	},
	archiveEmployee: async ({ locals, url }) => {
		const { user } = locals;
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { error: 'Employee ID is required' });
		}

		const archivedEmployee = await xata.db.employees.update(id, {
			archived: true
		});

		return {
			archivedEmployee
		};
	},
	restoreEmployee: async ({ locals, url }) => {
		const { user } = locals;
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { error: 'Employee ID is required' });
		}

		const restoredEmployee = await xata.db.employees.update(id, {
			archived: false
		});

		return {
			restoredEmployee
		};
	}
};
