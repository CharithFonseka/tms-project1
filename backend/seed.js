require('dotenv').config();
const supabase = require('./src/config/db');
const { hashPassword } = require('./src/utils/password.util');

async function seed() {
    try {
        console.log("Checking for existing users...");
        const { data: existingUsers, error: fetchErr } = await supabase.from('Users').select('id');
        
        if (fetchErr) {
            throw fetchErr;
        }

        if (existingUsers && existingUsers.length > 0) {
            console.log("Database already has users. No need to seed.");
            process.exit(0);
        }

        console.log("Creating initial Admin user...");
        const hashed = await hashPassword('Admin@123!');
        
        const { data, error } = await supabase.from('Users').insert({
            name: 'System Admin',
            email: 'admin@example.com',
            role: 'Admin',
            password: hashed,
            must_reset_password: false,
            is_active: true
        }).select();

        if (error) {
            throw error;
        }
        
        console.log("Successfully created Admin user!");
        console.log("-----------------------------------------");
        console.log(`Email: admin@example.com`);
        console.log(`Password: Admin@123!`);
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("Failed to seed database:", err);
    }
}

seed();
