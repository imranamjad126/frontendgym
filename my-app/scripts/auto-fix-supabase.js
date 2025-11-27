/**
 * AUTO-FIX SUPABASE ADMIN USER
 * This script checks and creates admin user in Supabase
 * 
 * Usage: node scripts/auto-fix-supabase.js
 * 
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable
 */

const https = require('https');

const SUPABASE_URL = 'https://zoddbringdphqyrkwpfe.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = 'fitnesswithimran1@gmail.com';
const ADMIN_PASSWORD = 'Aa543543@';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function checkAuthUser() {
  const url = `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(ADMIN_EMAIL)}`;
  return makeRequest(url);
}

async function createAuthUser() {
  const url = `${SUPABASE_URL}/auth/v1/admin/users`;
  return makeRequest(url, {
    method: 'POST',
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        role: 'ADMIN'
      }
    }
  });
}

async function updateAuthUser(userId) {
  const url = `${SUPABASE_URL}/auth/v1/admin/users/${userId}`;
  return makeRequest(url, {
    method: 'PATCH',
    body: {
      email_confirm: true
    }
  });
}

async function checkUsersTable(userId) {
  const url = `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`;
  return makeRequest(url);
}

async function createUsersTableRecord(userId) {
  const url = `${SUPABASE_URL}/rest/v1/users`;
  return makeRequest(url, {
    method: 'POST',
    body: {
      id: userId,
      email: ADMIN_EMAIL,
      role: 'ADMIN',
      gym_id: null
    }
  });
}

async function updateUsersTableRecord(userId) {
  const url = `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`;
  return makeRequest(url, {
    method: 'PATCH',
    body: {
      role: 'ADMIN',
      gym_id: null
    }
  });
}

async function main() {
  console.log('🔍 Starting Supabase Auto-Fix...\n');

  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set!');
    console.log('\nTo get your service role key:');
    console.log('1. Go to Supabase Dashboard → Settings → API');
    console.log('2. Copy "service_role" key (NOT anon key)');
    console.log('3. Run: export SUPABASE_SERVICE_ROLE_KEY=your_key_here');
    process.exit(1);
  }

  try {
    // 1. Check if auth user exists
    console.log('1. Checking auth user...');
    const authCheck = await checkAuthUser();
    
    let userId = null;
    if (authCheck.status === 200 && authCheck.data.users && authCheck.data.users.length > 0) {
      userId = authCheck.data.users[0].id;
      const user = authCheck.data.users[0];
      console.log(`   ✅ Auth user exists: ${user.email}`);
      
      // Check email confirmed
      if (!user.email_confirmed_at) {
        console.log('   ⚠️  Email not confirmed, updating...');
        const updateRes = await updateAuthUser(userId);
        if (updateRes.status === 200) {
          console.log('   ✅ Email confirmed');
        }
      } else {
        console.log('   ✅ Email confirmed');
      }
    } else {
      console.log('   ❌ Auth user not found, creating...');
      const createRes = await createAuthUser();
      if (createRes.status === 200 || createRes.status === 201) {
        userId = createRes.data.id;
        console.log(`   ✅ Auth user created: ${createRes.data.email}`);
      } else {
        console.error(`   ❌ Failed to create auth user: ${createRes.status}`);
        console.error(`   Response: ${JSON.stringify(createRes.data)}`);
        process.exit(1);
      }
    }

    if (!userId) {
      console.error('❌ No user ID available');
      process.exit(1);
    }

    // 2. Check users table record
    console.log('\n2. Checking users table record...');
    const usersCheck = await checkUsersTable(userId);
    
    if (usersCheck.status === 200 && usersCheck.data && usersCheck.data.length > 0) {
      const userRecord = usersCheck.data[0];
      console.log(`   ✅ Users table record exists`);
      console.log(`      Role: ${userRecord.role}`);
      console.log(`      Gym ID: ${userRecord.gym_id || 'NULL'}`);
      
      // Check if role is ADMIN
      if (userRecord.role !== 'ADMIN') {
        console.log('   ⚠️  Role is not ADMIN, updating...');
        const updateRes = await updateUsersTableRecord(userId);
        if (updateRes.status === 200 || updateRes.status === 204) {
          console.log('   ✅ Role updated to ADMIN');
        }
      }
    } else {
      console.log('   ❌ Users table record not found, creating...');
      const createRes = await createUsersTableRecord(userId);
      if (createRes.status === 200 || createRes.status === 201) {
        console.log('   ✅ Users table record created');
      } else {
        console.error(`   ❌ Failed to create users table record: ${createRes.status}`);
        console.error(`   Response: ${JSON.stringify(createRes.data)}`);
        console.log('\n   💡 Try running this SQL manually:');
        console.log(`   INSERT INTO users (id, email, role, gym_id) VALUES ('${userId}', '${ADMIN_EMAIL}', 'ADMIN', NULL) ON CONFLICT (id) DO UPDATE SET role = 'ADMIN', gym_id = NULL;`);
      }
    }

    console.log('\n✅ Supabase Auto-Fix Complete!');
    console.log(`\nAdmin User:`);
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`  Role: ADMIN`);
    console.log(`  Gym ID: NULL`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };


