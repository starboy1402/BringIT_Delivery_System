/**
 * @file Database barrel export
 *
 * Re-exports every database module from a single location
 * so the rest of the app can import like:
 *   import { usersDB, requestsDB } from '@/lib/db';
 */

// Re-export all modules
export { usersDB } from './usersDB';
export { requestsDB } from './requestsDB';
export { messagesDB } from './messagesDB';
export { notificationsDB } from './notificationsDB';
export { themeDB } from './themeDB';
