import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	cookies.delete('sessionId', { path: '/' });
	redirect(303, '/login');
};

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete('sessionId', { path: '/' });
	redirect(303, '/login');
};
