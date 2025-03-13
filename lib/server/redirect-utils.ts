'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Performs a server-side redirect.
 * Note: This should only be used in Server Components, not in Server Actions
 * that are called from Client Components.
 * 
 * @param path The path to redirect to
 */
export async function serverRedirect(path: string) {
  // Perform the redirect immediately
  redirect(path);
} 