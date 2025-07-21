import { getXataClient, type UsersRecord } from './xata';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('sessionId');

	if (!sessionId) {
		event.locals.user = null;
		event.locals.orgCode = null;
		return resolve(event);
	}

	let userId: string | undefined;
	let orgCode: string | null = null;

	// Check if the session is in the new JSON format or the old raw ID format
	if (sessionId.startsWith('{')) {
		try {
			const sessionPayload = JSON.parse(sessionId);
			userId = sessionPayload.userId;
			orgCode = sessionPayload.orgCode;
		} catch (e) {
			console.error('Failed to parse session JSON:', e);
			userId = undefined;
		}
	} else {
		// Assume old format where the cookie is just the user ID
		userId = sessionId;
	}

	if (userId) {
		const xata = getXataClient();
		// Fetch user and gracefully handle if the ID is invalid
		const user = (await xata.db.users.read(userId).catch(() => null)) as UsersRecord | null;

		if (user) {
			event.locals.user = user;
			event.locals.orgCode = orgCode; // This will be null for old sessions, which is correct
		} else {
			event.locals.user = null;
			event.locals.orgCode = null;
		}
	} else {
		event.locals.user = null;
		event.locals.orgCode = null;
	}

	return resolve(event);
};
