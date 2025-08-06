import { getXataClient, type UsersRecord } from './xata';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('sessionId');

	if (!sessionId) {
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
		// Invalid session, redirect to login
		event.cookies.delete('sessionId', { path: '/' });
		if (event.url.pathname !== '/login') {
			redirect(303, '/login');
		}
		return resolve(event);
	}

	if (!userId) {
		if (event.url.pathname !== '/login') {
			redirect(303, '/login');
		}
		return resolve(event);
	}

	try {
		const xata = getXataClient();
		const user = await xata.db.users.filter({ id: userId }).getFirst();

		if (user) {
			event.locals.user = user as UsersRecord;
			event.locals.orgCode = orgCode;

			let isAdmin = false;
			if (orgCode) {
				const organization: any =
					await xata.sql`SELECT admin FROM "organization" WHERE "code" = ${orgCode} LIMIT 1`;
				const admin = organization.records[0]?.admin;
				if (admin === user.username) {
					isAdmin = true;
				}
			} else {
				isAdmin = true;
			}
			event.locals.isAdmin = isAdmin;

			if (event.url.pathname === '/login') {
				redirect(303, '/');
			}
		} else {
			event.cookies.delete('sessionId', { path: '/' });
			if (event.url.pathname !== '/login') {
				redirect(303, '/login');
			}
		}
	} catch (error) {
		console.error('[Hooks] Error fetching user:', error);
		if (event.url.pathname !== '/login') {
			redirect(303, '/login');
		}
	}

	return resolve(event);
};
