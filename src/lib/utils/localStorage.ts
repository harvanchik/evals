import type { Employee, PerformanceEntry, JobTitle, Tag } from '$lib/types';

const EMPLOYEES_KEY = 'employees';
const PERFORMANCE_ENTRIES_KEY = 'performanceEntries';
const JOB_TITLES_KEY = 'jobTitles';
const TAGS_KEY = 'tags';

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

export function getTags(): Tag[] {
	const data = localStorage.getItem(TAGS_KEY);
	return data ? JSON.parse(data) : [];
}

export function saveTags(tags: Tag[]) {
	localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
}

export function initializeMockData() {
	if (!localStorage.getItem(EMPLOYEES_KEY)) {
		const mockEmployees: Employee[] = [
			{
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				jobTitle: 'Developer',
				archived: false
			},
			{
				id: 2,
				firstName: 'Jane',
				lastName: 'Smith',
				jobTitle: 'Designer',
				archived: false
			}
		];
		saveEmployees(mockEmployees);
	}

	if (!localStorage.getItem(PERFORMANCE_ENTRIES_KEY)) {
		const mockEntries: PerformanceEntry[] = [
			{
				id: 1,
				employeeId: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				description: 'Completed the new feature ahead of schedule.',
				rating: 5
			}
		];
		savePerformanceEntries(mockEntries);
	}

	if (!localStorage.getItem(JOB_TITLES_KEY)) {
		const mockJobTitles: JobTitle[] = [
			{ id: 1, name: 'Developer', description: 'Writes code', color: '#3b82f6' },
			{ id: 2, name: 'Designer', description: 'Designs things', color: '#a855f7' },
			{ id: 3, name: 'Manager', description: 'Manages people', color: '#ef4444' }
		];
		saveJobTitles(mockJobTitles);
	}

	if (!localStorage.getItem(TAGS_KEY)) {
		const mockTags: Tag[] = [
			{ id: 1, name: 'Teamwork' },
			{ id: 2, name: 'Excellence' },
			{ id: 3, name: 'Adaptability' },
			{ id: 4, name: 'Mentorship' },
			{ id: 5, name: 'Communication' },
			{ id: 6, name: 'Respect' }
		];
		saveTags(mockTags);
	}
}
