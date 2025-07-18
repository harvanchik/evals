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
	createdAt: string;
	updatedAt: string;
	description: string;
	rating: number;
	tagIds?: number[];
	history?: {
		description: string;
		rating: number;
		tagIds?: number[];
		updatedAt: string;
	}[];
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
