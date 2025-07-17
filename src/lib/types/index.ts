export interface Employee {
	id: number;
	name: string;
	jobTitle: string;
	department: string;
}

export interface PerformanceEntry {
	id: number;
	employeeId: number;
	date: string;
	description: string;
	rating: number;
}

export interface JobTitle {
	id: number;
	name: string;
}
