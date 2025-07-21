import type { LayoutServerLoad } from './$types';
import { getXataClient } from '../xata';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { user, orgCode } = locals;
	if (!user) {
		return {
			user: null,
			employees: [],
			positions: [],
			tags: []
		};
	}

	const xata = getXataClient();
	const filter = orgCode ? { org: orgCode } : { user: user.username };

	const [employees, positions, fetchedTags] = await Promise.all([
		xata.db.employees.filter(filter).getAll(),
		xata.db.positions.filter(filter).getAll(),
		xata.db.tags.filter(filter).getAll()
	]);

	let tags = fetchedTags;

	if (tags.length === 0) {
		const defaultTags = [
			{ name: 'teamwork', color: '#A0C4FF' },
			{ name: 'excellence', color: '#CAFFBF' },
			{ name: 'adaptability', color: '#FFD6A5' },
			{ name: 'mentorship', color: '#bdb2ff' },
			{ name: 'communication', color: '#9BF6FF' },
			{ name: 'respect', color: '#FFADAD' }
		].map((tag) => ({
			...tag,
			user: user.username,
			...(orgCode && { org: orgCode })
		}));
		await xata.db.tags.create(defaultTags);
		tags = await xata.db.tags.filter(filter).getAll();
	}

	return {
		user: locals.user,
		employees: employees.map((e) => e.toSerializable()),
		positions: positions.map((p) => p.toSerializable()),
		tags: tags.map((t) => t.toSerializable())
	};
};
