import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getXataClient } from '../../xata';

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const username = data.get('username') as string;
		const password = (data.get('password') as string) || null;

		if (!username) {
			return fail(400, { error: 'Username is required.' });
		}

		const xata = getXataClient();
		let user = await xata.db.users.filter({ username }).getFirst();

		if (user) {
			// User exists, check password
			if (user.password !== password) {
				return fail(400, { error: 'Invalid password.' });
			}
		} else {
			// User does not exist, create a new one
			const newUser = await xata.db.users.create({
				username,
				password
			});
			user = newUser;
		}

		if (user) {
			cookies.set('sessionId', user.id, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7 // one week
			});
			redirect(303, '/');
		}

		return fail(500, { error: 'An unexpected error occurred.' });
	}
};
