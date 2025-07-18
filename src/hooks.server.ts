import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { getXataClient } from './xata';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('sessionId');

	if (sessionId) {
		const xata = getXataClient();
		try {
			// In Xata, the record ID is just `id` on the record object.
			const user = await xata.db.users.read(sessionId);
			event.locals.user = user || null;
		} catch (error) {
			// Invalid session ID or other DB error
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	// Redirect to login if not authenticated and not on the login page
	if (!event.locals.user && event.url.pathname !== '/login') {
		redirect(303, '/login');
	}

	// Redirect to home if authenticated and on the login page
	if (event.locals.user && event.url.pathname === '/login') {
		redirect(303, '/');
	}

	return resolve(event);
};
