import { getXataClient, type UsersRecord } from './xata';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	console.log(`[Hooks] Handling request for: ${event.url.pathname}`);
	const sessionId = event.cookies.get('sessionId');

	if (!sessionId) {
		console.log('[Hooks] No session cookie found.');
		event.locals.user = null;
		event.locals.orgCode = null;
		if (event.url.pathname !== '/login') {
			console.log('[Hooks] Redirecting to /login');
			redirect(303, '/login');
		}
		console.log('[Hooks] Resolving request without user.');
		return resolve(event);
	}

	console.log('[Hooks] Session cookie found.');
	let userId: string | undefined;
	let orgCode: string | null = null;

	try {
		const sessionPayload = JSON.parse(sessionId);
		userId = sessionPayload.userId;
		orgCode = sessionPayload.orgCode;
		console.log(`[Hooks] Parsed session: userId=${userId}, orgCode=${orgCode}`);
	} catch (e) {
		userId = undefined;
		console.log('[Hooks] Failed to parse session cookie.');
	}

	if (userId) {
		try {
			const xata = getXataClient();
			console.log(`[Hooks] Fetching user with ID: ${userId}`);
			const user = await xata.db.users.filter({ id: userId }).getFirst();

			if (user) {
				console.log(`[Hooks] User found: ${user.username}`);
				event.locals.user = user as UsersRecord;
				event.locals.orgCode = orgCode;

				if (event.url.pathname === '/login') {
					console.log('[Hooks] User is logged in, redirecting from /login to /');
					redirect(303, '/');
				}
			} else {
				console.log('[Hooks] User not found for ID, clearing session.');
				event.locals.user = null;
				event.locals.orgCode = null;
				event.cookies.delete('sessionId', { path: '/' });
				if (event.url.pathname !== '/login') {
					console.log('[Hooks] Redirecting to /login');
					redirect(303, '/login');
				}
			}
		} catch (error) {
			console.error('[Hooks] Error fetching user:', error);
			event.locals.user = null;
			event.locals.orgCode = null;
			if (event.url.pathname !== '/login') {
				console.log('[Hooks] Redirecting to /login due to error.');
				redirect(303, '/login');
			}
		}
	} else {
		console.log('[Hooks] No userId in session, clearing session.');
		event.locals.user = null;
		event.locals.orgCode = null;
		if (event.url.pathname !== '/login') {
			console.log('[Hooks] Redirecting to /login');
			redirect(303, '/login');
		}
	}

	console.log('[Hooks] Resolving request.');
	return resolve(event);
};
