// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { UserRole, UserStatus } from '$lib/server/db/schema';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: number;
				name: string;
				whatsapp: string;
				role: UserRole;
				status: UserStatus;
				createdAt: Date;
			} | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
