// ⚠️ TEMPORARY STUB — DO NOT MERGE TO MAIN.
// Replace with Person 3's real implementation later.
const supabase = require('../../config/db');

async function createNotification({ userId, message, type }) {
    const { error } = await supabase.from('Notifications').insert({ user_id: userId, message });
    if (error) console.error('[notification stub] failed to insert:', error.message);
    console.log(`[notification stub] -> user ${userId}: "${message}" (${type})`);
}

module.exports = { createNotification };