import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getXataClient } from '../../xata';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(303, '/');
	}
};

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const username = data.get('username') as string;
		const password = (data.get('password') as string) || null;
		const orgCode = (data.get('organization') as string)?.toLowerCase() || null;

		if (!username) {
			return fail(400, { error: 'Username is required.' });
		}

		const xata = getXataClient();

		if (orgCode) {
			const organization = await xata.db.organization.filter({ code: orgCode }).getFirst();
			if (!organization) {
				return fail(400, { error: `Organization with code "${orgCode}" not found.` });
			}
		}

		let user = await xata.db.users.filter({ username }).getFirst();

		if (user) {
			// User exists, check password
			if (user.password !== password) {
				return fail(400, { error: 'Invalid password.' });
			}
		} else {
			// User does not exist, create a new one
			const newUser: { username: string; password: string | null; org?: string } = {
				username,
				password
			};
			if (orgCode) {
				newUser.org = orgCode;
			}
			const createdUser = await xata.db.users.create(newUser);
			user = createdUser;
		}

		if (user) {
			const sessionPayload = {
				userId: user.id,
				orgCode: orgCode
			};
			cookies.set('sessionId', JSON.stringify(sessionPayload), {
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
