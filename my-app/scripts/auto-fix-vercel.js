/**
 * AUTO-FIX VERCEL ENVIRONMENT VARIABLES
 * This script checks and fixes Vercel environment variables
 * 
 * Usage: node scripts/auto-fix-vercel.js
 * 
 * Requires VERCEL_TOKEN environment variable
 */

const https = require('https');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_NAME = 'mynew-frontendgym';
const REQUIRED_VARS = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://zoddbringdphqyrkwpfe.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZGRicmluZ2RwaHF5cmt3cGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTQ3MDAsImV4cCI6MjA3OTYzMDcwMH0.U3W-u_poRkgS90r7_OUZYnFoFlwxpLDCkrChhn32nvg'
};

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
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
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function getProject() {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${PROJECT_NAME}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  return makeRequest(options);
}

async function getEnvVars() {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${PROJECT_NAME}/env`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  return makeRequest(options);
}

async function createEnvVar(key, value, environment = ['production', 'preview', 'development']) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${PROJECT_NAME}/env`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  return makeRequest(options, {
    key,
    value,
    type: 'encrypted',
    target: environment
  });
}

async function updateEnvVar(envId, value, environment = ['production', 'preview', 'development']) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${PROJECT_NAME}/env/${envId}`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  return makeRequest(options, {
    value,
    target: environment
  });
}

async function deleteEnvVar(envId) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${PROJECT_NAME}/env/${envId}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  return makeRequest(options);
}

async function createDeployment() {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v13/deployments?project=${PROJECT_NAME}`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  return makeRequest(options, {
    name: PROJECT_NAME,
    target: 'production'
  });
}

async function main() {
  console.log('🔍 Starting Vercel Auto-Fix...\n');

  if (!VERCEL_TOKEN) {
    console.error('❌ VERCEL_TOKEN environment variable not set!');
    console.log('\nTo get your token:');
    console.log('1. Go to https://vercel.com/account/tokens');
    console.log('2. Create a new token');
    console.log('3. Run: export VERCEL_TOKEN=your_token_here');
    process.exit(1);
  }

  try {
    // 1. Check project exists
    console.log('1. Checking project...');
    const projectRes = await getProject();
    if (projectRes.status !== 200) {
      console.error(`❌ Project not found: ${projectRes.status}`);
      process.exit(1);
    }
    console.log('✅ Project found\n');

    // 2. Get current env vars
    console.log('2. Checking environment variables...');
    const envRes = await getEnvVars();
    if (envRes.status !== 200) {
      console.error(`❌ Failed to get env vars: ${envRes.status}`);
      process.exit(1);
    }

    const envVars = envRes.data.envs || [];
    const existingVars = {};
    envVars.forEach(v => {
      if (v.key in REQUIRED_VARS) {
        existingVars[v.key] = v;
      }
    });

    // 3. Check and fix each required var
    const fixes = [];
    for (const [key, expectedValue] of Object.entries(REQUIRED_VARS)) {
      const existing = existingVars[key];
      
      if (!existing) {
        console.log(`   ❌ ${key}: MISSING`);
        console.log(`   ➕ Creating ${key}...`);
        const createRes = await createEnvVar(key, expectedValue);
        if (createRes.status === 200 || createRes.status === 201) {
          console.log(`   ✅ Created ${key}`);
          fixes.push(`Created ${key}`);
        } else {
          console.error(`   ❌ Failed to create ${key}: ${createRes.status}`);
        }
      } else {
        // Check if value matches
        const currentValue = existing.value;
        if (currentValue !== expectedValue) {
          console.log(`   ⚠️  ${key}: INCORRECT VALUE`);
          console.log(`   🔄 Updating ${key}...`);
          const updateRes = await updateEnvVar(existing.id, expectedValue);
          if (updateRes.status === 200) {
            console.log(`   ✅ Updated ${key}`);
            fixes.push(`Updated ${key}`);
          } else {
            console.error(`   ❌ Failed to update ${key}: ${updateRes.status}`);
          }
        } else {
          console.log(`   ✅ ${key}: Correct`);
        }
      }
    }

    console.log('\n3. Triggering redeploy...');
    const deployRes = await createDeployment();
    if (deployRes.status === 200 || deployRes.status === 201) {
      console.log('✅ Deployment triggered');
      console.log(`   URL: ${deployRes.data.url || 'Check Vercel dashboard'}`);
    } else {
      console.log('⚠️  Auto-deploy failed, please redeploy manually');
      console.log('   Go to: https://vercel.com/dashboard');
    }

    console.log('\n✅ Vercel Auto-Fix Complete!');
    console.log('\nFixes applied:');
    fixes.forEach(f => console.log(`  - ${f}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };


