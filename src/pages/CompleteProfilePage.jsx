/**
 * @file CompleteProfilePage - Fill in student details after first Google login
 *
 * When a user signs in with Google for the first time, they need to
 * provide their student ID, department, batch, hall, and phone number.
 * This page is shown when the user's profile is missing a student_id.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AlertCircle } from 'lucide-react';
import { useAuth, useToast } from '@/contexts';
import { usersDB } from '@/lib/db';
import { Button, Card } from '@/components/ui';
import { DEPARTMENTS, BATCHES, HALLS, INPUT_CLASS } from '@/constants';

export function CompleteProfilePage() {
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setError('');

        const form = new FormData(e.currentTarget);
        const studentId = form.get('studentId')?.trim();
        const phone = form.get('phone')?.trim();

        // Validation
        if (!studentId || !phone) {
            setError('Please fill in all required fields');
            return;
        }
        if (!/^01[3-9]\d{8}$/.test(phone)) {
            setError('Phone number must be a valid BD number (e.g. 01712345678)');
            return;
        }

        setSaving(true);
        const updated = await usersDB.updateProfile(user.id, {
            studentId,
            department: form.get('department'),
            batch: form.get('batch'),
            hall: form.get('hall'),
            phone,
        });

        if (updated) {
            await refreshUser();
            showToast('Profile completed! Welcome to CUETConnect 🎉');
            navigate('/feed');
        } else {
            setError('Failed to save profile. Please try again.');
        }
        setSaving(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 page-enter">
            <Card className="w-full max-w-lg">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <User className="w-7 h-7 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Welcome{user?.name ? `, ${user.name}` : ''}! Please fill in your student details.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2 animate-scale-in" role="alert">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label htmlFor="cp-studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Student ID *
                                </label>
                                <input
                                    id="cp-studentId"
                                    name="studentId"
                                    type="text"
                                    className={INPUT_CLASS}
                                    placeholder="e.g. u1904001"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="cp-dept" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Department
                                </label>
                                <select id="cp-dept" name="department" className={`${INPUT_CLASS} appearance-auto`}>
                                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="cp-batch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Batch
                                </label>
                                <select id="cp-batch" name="batch" className={`${INPUT_CLASS} appearance-auto`}>
                                    {BATCHES.map((b) => <option key={b}>{b}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="cp-hall" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Hall
                                </label>
                                <select id="cp-hall" name="hall" className={`${INPUT_CLASS} appearance-auto`}>
                                    {HALLS.map((h) => <option key={h}>{h}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="cp-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Phone *
                                </label>
                                <input
                                    id="cp-phone"
                                    name="phone"
                                    type="tel"
                                    className={INPUT_CLASS}
                                    placeholder="017xxxxxxxx"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full py-2.5 mt-2" disabled={saving}>
                            {saving ? 'Saving...' : 'Complete Profile'}
                        </Button>
                    </form>
                </div>
            </Card>
        </main>
    );
}
