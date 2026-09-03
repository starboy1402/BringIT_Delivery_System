/**
 * @file Error handling utilities
 * 
 * Standardizes how database responses and errors are handled
 * throughout the application.
 */

/**
 * Standardized response wrapper for database operations.
 * Use this in your DB modules to return consistent results.
 * 
 * @param {any} data - The successful result data
 * @param {any} error - The error object or message
 */
export const dbResponse = (data = null, error = null) => ({ data, error });

/**
 * Formats a Supabase/Postgrest error into a user-friendly string.
 * 
 * @param {Object|string} err - The error from Supabase
 * @returns {string} User-friendly error message
 */
export function formatError(err) {
    if (!err) return null;
    
    // Handle Supabase error objects
    if (err.code) {
        switch (err.code) {
            case '23505': return 'This record already exists.';
            case '42P01': return 'Database configuration error.';
            case 'PGRST116': return 'Requested record not found.';
            default: break;
        }
    }

    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    
    return 'An unexpected error occurred. Please try again.';
}
