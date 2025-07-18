export interface Employee {
	id: number;
	firstName: string;
	lastName: string;
	nickname?: string;
	jobTitle: string;
	archived: boolean;
}

export interface PerformanceEntry {
	id: number;
	employeeId: number;
	date: string;
	description: string;
	rating: number;
	tagIds?: number[];
}

export interface JobTitle {
	id: number;
	name: string;
	description?: string;
	color?: string;
}

export interface Tag {
	id: number;
	name: string;
}
