import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getXataClient } from '../../xata';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, '/login');
	}

	return {
		user: locals.user
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized', formId: 'updateProfile' });
		}

		const data = await request.formData();
		const username = data.get('username') as string;
		const first_name = data.get('first_name') as string;
		const last_name = data.get('last_name') as string;

		if (!username) {
			return fail(400, { error: 'Username is required.', formId: 'updateProfile' });
		}

		const xata = getXataClient();
		await xata.db.users.update(locals.user.id, { username, first_name, last_name });

		return { success: 'Profile updated successfully.', formId: 'updateProfile' };
	},

	changePassword: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized', formId: 'changePassword' });
		}

		const data = await request.formData();
		const oldPassword = data.get('oldPassword') as string;
		const newPassword = data.get('newPassword') as string;
		const repeatPassword = data.get('repeatPassword') as string;

		if (newPassword !== repeatPassword) {
			return fail(400, { error: 'New passwords do not match.', formId: 'changePassword' });
		}

		const xata = getXataClient();
		const user = await xata.db.users.read(locals.user.id);

		if (!user) {
			return fail(404, { error: 'User not found.', formId: 'changePassword' });
		}

		// If user has a password, verify the old password
		if (user.password && user.password !== oldPassword) {
			return fail(400, { error: 'Invalid old password.', formId: 'changePassword' });
		}

		const passwordToSet = newPassword === '' ? null : newPassword;
		await xata.db.users.update(user.id, { password: passwordToSet });

		let successMessage = '';
		if (!user.password && passwordToSet) {
			successMessage = 'Password created successfully.';
		} else if (user.password && passwordToSet) {
			successMessage = 'Password changed successfully.';
		} else if (user.password && !passwordToSet) {
			successMessage = 'Password removed successfully.';
		}

		return { success: successMessage, formId: 'changePassword' };
	}
};
