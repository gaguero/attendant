const http = require('http');

// Function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function checkDatabase() {
  try {
    console.log('🔍 Checking if our test user was created...');
    
    // Try to login with the test user credentials
    const loginData = {
      email: 'gagueromesen@gmail.com',
      password: '!BQBj6KBes4Tddi'
    };
    
    const loginOptions = {
      hostname: 'localhost',
      port: 3003,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    console.log('📡 Attempting to login with test user...');
    const loginResult = await makeRequest(loginOptions, loginData);
    
    if (loginResult.status === 200) {
      console.log('✅ Login successful! User exists in database.');
      console.log('📊 Full login response:', JSON.stringify(loginResult.data, null, 2));
      console.log('🔐 Token received:', loginResult.data.token ? 'Yes' : 'No');
      console.log('👤 User data:', loginResult.data.user);
      
      // Try to get user info with the token
      if (loginResult.data.token) {
        const meOptions = {
          hostname: 'localhost',
          port: 3003,
          path: '/api/v1/auth/me',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginResult.data.token}`,
            'Content-Type': 'application/json'
          }
        };
        
        console.log('\n📡 Getting user profile...');
        const meResult = await makeRequest(meOptions);
        console.log('👤 Full user profile:', JSON.stringify(meResult.data, null, 2));
      }
      
    } else {
      console.log('❌ Login failed:', loginResult.data);
      
      // Check if it's because user doesn't exist or wrong password
      if (loginResult.data.error && loginResult.data.error.includes('not found')) {
        console.log('💡 User was not created in database');
      } else if (loginResult.data.error && loginResult.data.error.includes('Invalid')) {
        console.log('💡 User exists but password is wrong (this means registration worked!)');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();