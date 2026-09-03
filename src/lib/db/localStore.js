/**
 * @file Local in-memory / localStorage store for BringIT Demo & Offline Mode
 * Provides full interactive CRUD support with realistic state persistence.
 */

import { INITIAL_USERS, INITIAL_REQUESTS, INITIAL_MESSAGES, INITIAL_NOTIFICATIONS } from '@/lib/mockData';

const STORAGE_KEYS = {
    USERS: 'bringit_mock_users',
    REQUESTS: 'bringit_mock_requests',
    MESSAGES: 'bringit_mock_messages',
    NOTIFICATIONS: 'bringit_mock_notifications',
    CURRENT_DEMO_USER_ID: 'bringit_current_demo_user_id',
};

function loadStorage(key, defaultVal) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch {
        return defaultVal;
    }
}

function saveStorage(key, val) {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
        console.warn('Storage save failed:', e);
    }
}

let users = loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
let requests = loadStorage(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
let messages = loadStorage(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
let notifications = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
let activeUserId = loadStorage(STORAGE_KEYS.CURRENT_DEMO_USER_ID, 'usr-101'); // Default to Tanvir

export const localStore = {
    // ── User / Profiles ──
    getUsers() {
        return [...users];
    },
    getUser(id) {
        return users.find(u => u.id === id) || null;
    },
    getActiveUser() {
        return users.find(u => u.id === activeUserId) || users[0];
    },
    setActiveUser(id) {
        activeUserId = id;
        saveStorage(STORAGE_KEYS.CURRENT_DEMO_USER_ID, id);
    },
    updateUser(id, updates) {
        const idx = users.findIndex(u => u.id === id);
        if (idx === -1) return null;
        users[idx] = { ...users[idx], ...updates };
        saveStorage(STORAGE_KEYS.USERS, users);
        return { ...users[idx] };
    },
    countUsers() {
        return users.length;
    },

    // ── Requests ──
    getRequests(filters = {}, { limit = 30, offset = 0 } = {}) {
        let list = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (filters.status && filters.status !== 'All') {
            list = list.filter(r => r.status.toLowerCase() === filters.status.toLowerCase());
        }
        if (filters.urgency && filters.urgency !== 'All') {
            list = list.filter(r => r.urgency.toLowerCase() === filters.urgency.toLowerCase());
        }
        if (filters.search) {
            const q = filters.search.toLowerCase();
            list = list.filter(r =>
                r.item.toLowerCase().includes(q) ||
                r.pickup.toLowerCase().includes(q) ||
                r.dropoff.toLowerCase().includes(q) ||
                (r.requesterName && r.requesterName.toLowerCase().includes(q))
            );
        }

        const total = list.length;
        const data = list.slice(offset, offset + limit);
        return { data, total };
    },
    getRequestById(id) {
        return requests.find(r => r.id === id) || null;
    },
    createRequest(data) {
        const newReq = {
            id: `req-${Date.now().toString(36)}`,
            ...data,
            status: 'Open',
            reward: Number(data.reward) || 50,
            reportedBy: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        requests = [newReq, ...requests];
        saveStorage(STORAGE_KEYS.REQUESTS, requests);

        // Update user stats
        if (data.requesterId) {
            const u = this.getUser(data.requesterId);
            if (u) {
                this.updateUser(u.id, { requestsPosted: (u.requestsPosted || 0) + 1 });
            }
        }
        return newReq;
    },
    updateRequest(id, updates) {
        const idx = requests.findIndex(r => r.id === id);
        if (idx === -1) return null;
        requests[idx] = { ...requests[idx], ...updates, updatedAt: new Date().toISOString() };
        saveStorage(STORAGE_KEYS.REQUESTS, requests);
        return { ...requests[idx] };
    },
    deleteRequest(id) {
        requests = requests.filter(r => r.id !== id);
        saveStorage(STORAGE_KEYS.REQUESTS, requests);
        return true;
    },
    getRequestStats() {
        const open = requests.filter(r => r.status === 'Open').length;
        const inProgress = requests.filter(r => ['Accepted', 'InProgress'].includes(r.status)).length;
        const completed = requests.filter(r => r.status === 'Completed').length;
        return { total: requests.length, open, inProgress, completed };
    },

    // ── Messages ──
    getMessages(requestId) {
        return messages
            .filter(m => m.requestId === requestId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },
    createMessage(data) {
        const newMsg = {
            id: `msg-${Date.now().toString(36)}`,
            ...data,
            createdAt: new Date().toISOString(),
        };
        messages = [...messages, newMsg];
        saveStorage(STORAGE_KEYS.MESSAGES, messages);
        return newMsg;
    },

    // ── Notifications ──
    getNotifications(userId) {
        return notifications
            .filter(n => !userId || n.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    getUnreadNotifsCount(userId) {
        return notifications.filter(n => (!userId || n.userId === userId) && !n.read).length;
    },
    addNotification(data) {
        const newNotif = {
            id: `notif-${Date.now().toString(36)}`,
            read: false,
            createdAt: new Date().toISOString(),
            ...data,
        };
        notifications = [newNotif, ...notifications];
        saveStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
        return newNotif;
    },
    markNotificationAsRead(id) {
        notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        saveStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    },
    markAllNotificationsAsRead(userId) {
        notifications = notifications.map(n => (!userId || n.userId === userId) ? { ...n, read: true } : n);
        saveStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    },

    // ── Reset ──
    resetToDefault() {
        users = [...INITIAL_USERS];
        requests = [...INITIAL_REQUESTS];
        messages = [...INITIAL_MESSAGES];
        notifications = [...INITIAL_NOTIFICATIONS];
        saveStorage(STORAGE_KEYS.USERS, users);
        saveStorage(STORAGE_KEYS.REQUESTS, requests);
        saveStorage(STORAGE_KEYS.MESSAGES, messages);
        saveStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
};
