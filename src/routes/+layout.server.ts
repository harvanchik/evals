import type { LayoutServerLoad } from './$types';
import { getXataClient } from '../xata';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return {
			user: null,
			employees: [],
			positions: [],
			tags: []
		};
	}

	const xata = getXataClient();
	const [employees, positions, fetchedTags] = await Promise.all([
		xata.db.employees.filter({ user: locals.user.username }).getAll(),
		xata.db.positions.filter({ user: locals.user.username }).getAll(),
		xata.db.tags.filter({ user: locals.user.username }).getAll()
	]);

	let tags = fetchedTags;

	if (tags.length === 0) {
		const defaultTags = [
			{ name: 'teamwork', color: '#A0C4FF', user: locals.user.username },
			{ name: 'excellence', color: '#CAFFBF', user: locals.user.username },
			{ name: 'adaptability', color: '#FFD6A5', user: locals.user.username },
			{ name: 'mentorship', color: '#bdb2ff', user: locals.user.username },
			{ name: 'communication', color: '#9BF6FF', user: locals.user.username },
			{ name: 'respect', color: '#FFADAD', user: locals.user.username }
		];
		const newTags = await xata.db.tags.create(defaultTags);
		tags = newTags;
	}

	return {
		user: locals.user,
		employees: employees.map((e) => e.toSerializable()),
		positions: positions.map((p) => p.toSerializable()),
		tags: tags.map((t) => t.toSerializable())
	};
};
