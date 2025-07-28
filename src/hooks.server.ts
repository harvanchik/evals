import { getXataClient, type UsersRecord } from './xata';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('sessionId');

	if (!sessionId) {
		event.locals.user = null;
		event.locals.orgCode = null;
		if (event.url.pathname !== '/login') {
			redirect(303, '/login');
		}
		return resolve(event);
	}

	let userId: string | undefined;
	let orgCode: string | null = null;

	try {
		const sessionPayload = JSON.parse(sessionId);
		userId = sessionPayload.userId;
		orgCode = sessionPayload.orgCode;
	} catch (e) {
		userId = undefined;
	}

	if (userId) {
		try {
			const xata = getXataClient();
			const user = await xata.db.users.filter({ id: userId }).getFirst();

			if (user) {
				event.locals.user = user as UsersRecord;
				event.locals.orgCode = orgCode;

				let isAdmin = false;
				if (orgCode) {
					const organization =
						await xata.sql`SELECT admin FROM "organization" WHERE "code" = ${orgCode} LIMIT 1`;
					console.log(organization.records[0]?.admin);
					if (organization && organization.records[0]?.admin === user.username) {
						isAdmin = true;
					}
				}
				// if no org code, then the user is an admin
				else {
					isAdmin = true;
				}

				if (event.url.pathname === '/login') {
					redirect(303, '/');
				}
			} else {
				event.locals.user = null;
				event.locals.orgCode = null;
				event.cookies.delete('sessionId', { path: '/' });
				if (event.url.pathname !== '/login') {
					redirect(303, '/login');
				}
			}
		} catch (error) {
			console.error('[Hooks] Error fetching user:', error);
			event.locals.user = null;
			event.locals.orgCode = null;
			if (event.url.pathname !== '/login') {
				redirect(303, '/login');
			}
		}
	} else {
		event.locals.user = null;
		event.locals.orgCode = null;
		if (event.url.pathname !== '/login') {
			redirect(303, '/login');
		}
	}

	return resolve(event);
};
