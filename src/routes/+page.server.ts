import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getXataClient } from '../xata';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { user, orgCode } = locals;
	if (!user) {
		redirect(303, '/login');
	}

	const { employees } = await parent();
	const activeEmployees = employees.filter((emp) => emp.archived !== true);

	const xata = getXataClient();
	const baseFilter = orgCode ? { org: orgCode } : { user: user.username, $notExists: 'org' };

	const filterWithArchived = {
		...baseFilter,
		'employee.archived': false
	};

	const performanceEntries = await xata.db.entries
		.select(['*', 'user.*'])
		.filter(filterWithArchived)
		.getAll();

	const totalEntries = performanceEntries.length;

	const reviewedEmployeeIds = new Set(
		performanceEntries.map((entry) => entry.employee?.id).filter((id) => id)
	);
	const totalEmployeesReviewed = reviewedEmployeeIds.size;

	const ratedEntries = performanceEntries.filter(
		(entry) => typeof entry.rating === 'number' && entry.rating > 0
	);
	const totalRating = ratedEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0);
	const avgRating = ratedEntries.length > 0 ? totalRating / ratedEntries.length : 0;

	const totalEmployeesNotEvaluated = activeEmployees.length - totalEmployeesReviewed;

	const entriesPerUser: Record<string, number> = {};
	for (const entry of performanceEntries) {
		const entryUsername = entry.user?.username;
		if (entryUsername) {
			entriesPerUser[entryUsername] = (entriesPerUser[entryUsername] || 0) + 1;
		}
	}

	const employeesWithStats = activeEmployees.map((employee) => {
		const entriesForEmployee = performanceEntries.filter(
			(entry) => entry.employee?.id === employee.id
		);
		const ratings = entriesForEmployee
			.map((e) => e.rating)
			.filter((r) => r !== null && r !== undefined) as number[];
		const averageRating =
			ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
		return {
			...employee,
			totalEntries: entriesForEmployee.length,
			avgRating: averageRating
		};
	});

	return {
		stats: {
			totalEntries,
			totalEmployeesReviewed,
			avgRating,
			totalEmployeesNotEvaluated,
			entriesPerUser
		},
		employees: employeesWithStats
	};
};
