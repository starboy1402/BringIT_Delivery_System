/**
 * @file Form validation utilities
 * 
 * Centralized logic for validating form inputs across the app.
 */

/**
 * Validates a new delivery request form.
 * 
 * @param {Object} data - { item, pickup, dropoff, reward, urgency }
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validateRequest(data) {
    const errors = {};
    
    if (!data.item?.trim()) {
        errors.item = 'What item needs to be delivered?';
    } else if (data.item.length > 50) {
        errors.item = 'Item name is too long.';
    }

    if (!data.pickup?.trim()) {
        errors.pickup = 'Where should the item be picked up?';
    }

    if (!data.dropoff?.trim()) {
        errors.dropoff = 'Where should the item be dropped off?';
    }

    const rewardNum = parseFloat(data.reward);
    if (isNaN(rewardNum)) {
        errors.reward = 'Reward must be a number.';
    } else if (rewardNum < 5) {
        errors.reward = 'Minimum reward is 5 BDT.';
    } else if (rewardNum > 10000) {
        errors.reward = 'Maximum reward is 10,000 BDT.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validates a user's profile update.
 * 
 * @param {Object} data - { phone, hall }
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validateProfile(data) {
    const errors = {};

    if (data.phone && !/^\d{11}$/.test(data.phone)) {
        errors.phone = 'Phone number must be exactly 11 digits.';
    }

    if (!data.hall?.trim()) {
        errors.hall = 'Please select your residential hall.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}
