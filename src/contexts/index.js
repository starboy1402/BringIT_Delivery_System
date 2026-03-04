/**
 * @file Contexts barrel export
 *
 * Re-exports all context providers and hooks from one place.
 * Import like: import { useAuth, useToast } from '@/contexts';
 */

export { AuthProvider, useAuth } from './AuthContext';
export { ToastProvider, useToast } from './ToastContext';
export { ThemeProvider, useTheme } from './ThemeContext';
export { ModalProvider, useModal } from './ModalContext';
