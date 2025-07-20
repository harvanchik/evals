import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getXataClient } from '../../xata';

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const username = data.get('username') as string;
		const password = (data.get('password') as string) || null;
		const organizationName = (data.get('organization') as string) || null;

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
			const newUser: any = {
				username,
				password
			};
			if (organizationName) {
				let organization = await xata.db.organizations
					.filter({ name: organizationName })
					.getFirst();
				if (!organization) {
					organization = await xata.db.organizations.create({ name: organizationName });
				}
				newUser.organization = organization.id;
			}
			const createdUser = await xata.db.users.create(newUser);
			user = createdUser;
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
