// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('./xata').UsersRecord | null;
			orgCode: string | null;
		}
		// interface PageData {}
		// interface Platform {}
	}
	const lucide: any;
}

export {};
