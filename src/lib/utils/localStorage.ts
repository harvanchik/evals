import type { Employee, PerformanceEntry, JobTitle } from '$lib/types';

const EMPLOYEES_KEY = 'employees';
const PERFORMANCE_ENTRIES_KEY = 'performanceEntries';
const JOB_TITLES_KEY = 'jobTitles';

export function getEmployees(): Employee[] {
	const data = localStorage.getItem(EMPLOYEES_KEY);
	return data ? JSON.parse(data) : [];
}

export function saveEmployees(employees: Employee[]) {
	localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
}

export function getPerformanceEntries(): PerformanceEntry[] {
	const data = localStorage.getItem(PERFORMANCE_ENTRIES_KEY);
	return data ? JSON.parse(data) : [];
}

export function savePerformanceEntries(entries: PerformanceEntry[]) {
	localStorage.setItem(PERFORMANCE_ENTRIES_KEY, JSON.stringify(entries));
}

export function getJobTitles(): JobTitle[] {
	const data = localStorage.getItem(JOB_TITLES_KEY);
	return data ? JSON.parse(data) : [];
}

export function saveJobTitles(jobTitles: JobTitle[]) {
	localStorage.setItem(JOB_TITLES_KEY, JSON.stringify(jobTitles));
}

export function initializeMockData() {
	if (!localStorage.getItem(EMPLOYEES_KEY)) {
		const mockEmployees: Employee[] = [
			{ id: 1, name: 'John Doe', jobTitle: 'Developer', department: 'IT' },
			{ id: 2, name: 'Jane Smith', jobTitle: 'Designer', department: 'Design' }
		];
		saveEmployees(mockEmployees);
	}

	if (!localStorage.getItem(PERFORMANCE_ENTRIES_KEY)) {
		const mockEntries: PerformanceEntry[] = [
			{
				id: 1,
				employeeId: 1,
				date: new Date().toISOString(),
				description: 'Completed the new feature ahead of schedule.',
				rating: 5
			}
		];
		savePerformanceEntries(mockEntries);
	}

	if (!localStorage.getItem(JOB_TITLES_KEY)) {
		const mockJobTitles: JobTitle[] = [
			{ id: 1, name: 'Developer' },
			{ id: 2, name: 'Designer' },
			{ id: 3, name: 'Manager' }
		];
		saveJobTitles(mockJobTitles);
	}
}
