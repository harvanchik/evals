import type { LayoutServerLoad } from './$types';
import { getXataClient } from '../xata';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		return { user: undefined, positions: [] };
	}

	const xata = getXataClient();
	const positions = await xata.db.positions.filter({ user: user.username }).getAll();

	return { user, positions };
};
 