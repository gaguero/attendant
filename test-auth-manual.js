const http = require('http');

const BASE_URL = 'http://localhost:3003/api/v1';

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsedBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAuth() {
  console.log('🧪 Testing Authentication Functions...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const health = await makeRequest('/health');
    console.log(`   ✅ Health: ${health.status} - ${health.body.status}`);
  } catch (error) {
    console.log(`   ❌ Health failed: ${error.message}`);
    return;
  }

  // Test 2: User Registration
  console.log('\n2. Testing User Registration...');
  try {
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'STAFF'
    };

    const register = await makeRequest('/auth-legacy/register', 'POST', registerData);
    console.log(`   ✅ Register: ${register.status} - ${register.body.success ? 'Success' : 'Failed'}`);
    
    if (register.body.success) {
      console.log(`   📧 User: ${register.body.data.user.email}`);
      console.log(`   🔑 Token: ${register.body.data.tokens.accessToken.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ Error: ${register.body.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Register failed: ${error.message}`);
  }

  // Test 3: User Login
  console.log('\n3. Testing User Login...');
  try {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const login = await makeRequest('/auth-legacy/login', 'POST', loginData);
    console.log(`   ✅ Login: ${login.status} - ${login.body.success ? 'Success' : 'Failed'}`);
    
    if (login.body.success) {
      console.log(`   📧 User: ${login.body.data.user.email}`);
      console.log(`   🔑 Token: ${login.body.data.tokens.accessToken.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ Error: ${login.body.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Login failed: ${error.message}`);
  }

  // Test 4: Get Current User (with token)
  console.log('\n4. Testing Get Current User...');
  try {
    // First get a token by logging in
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const login = await makeRequest('/auth-legacy/login', 'POST', loginData);
    
    if (login.body.success && login.body.data.tokens.accessToken) {
      const token = login.body.data.tokens.accessToken;
      
      const me = await makeRequest('/auth-legacy/me', 'GET', null, {
        'Authorization': `Bearer ${token}`
      });
      
      console.log(`   ✅ Get User: ${me.status} - ${me.body.success ? 'Success' : 'Failed'}`);
      
      if (me.body.success) {
        console.log(`   📧 User: ${me.body.data.email}`);
        console.log(`   👤 Name: ${me.body.data.firstName} ${me.body.data.lastName}`);
      } else {
        console.log(`   ❌ Error: ${me.body.error}`);
      }
    } else {
      console.log('   ❌ Could not get token for user test');
    }
  } catch (error) {
    console.log(`   ❌ Get User failed: ${error.message}`);
  }

  // Test 5: Forgot Password
  console.log('\n5. Testing Forgot Password...');
  try {
    const forgotData = {
      email: 'test@example.com'
    };

    const forgot = await makeRequest('/auth-legacy/forgot-password', 'POST', forgotData);
    console.log(`   ✅ Forgot Password: ${forgot.status} - ${forgot.body.success ? 'Success' : 'Failed'}`);
    
    if (forgot.body.success) {
      console.log(`   📧 Message: ${forgot.body.message}`);
    } else {
      console.log(`   ❌ Error: ${forgot.body.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Forgot Password failed: ${error.message}`);
  }

  // Test 6: Change Password
  console.log('\n6. Testing Change Password...');
  try {
    // First get a token
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const login = await makeRequest('/auth-legacy/login', 'POST', loginData);
    
    if (login.body.success && login.body.data.tokens.accessToken) {
      const token = login.body.data.tokens.accessToken;
      
      const changeData = {
        currentPassword: 'password123',
        newPassword: 'newpassword456'
      };

      const change = await makeRequest('/auth-legacy/change-password', 'POST', changeData, {
        'Authorization': `Bearer ${token}`
      });
      
      console.log(`   ✅ Change Password: ${change.status} - ${change.body.success ? 'Success' : 'Failed'}`);
      
      if (change.body.success) {
        console.log(`   📧 Message: ${change.body.message}`);
        
        // Test login with new password
        const newLoginData = {
          email: 'test@example.com',
          password: 'newpassword456'
        };

        const newLogin = await makeRequest('/auth-legacy/login', 'POST', newLoginData);
        console.log(`   ✅ New Password Login: ${newLogin.status} - ${newLogin.body.success ? 'Success' : 'Failed'}`);
      } else {
        console.log(`   ❌ Error: ${change.body.error}`);
      }
    } else {
      console.log('   ❌ Could not get token for password change test');
    }
  } catch (error) {
    console.log(`   ❌ Change Password failed: ${error.message}`);
  }

  // Test 7: Logout
  console.log('\n7. Testing Logout...');
  try {
    // First get a token
    const loginData = {
      email: 'test@example.com',
      password: 'newpassword456' // Use the new password
    };

    const login = await makeRequest('/auth-legacy/login', 'POST', loginData);
    
    if (login.body.success && login.body.data.tokens.accessToken) {
      const token = login.body.data.tokens.accessToken;
      
      const logout = await makeRequest('/auth-legacy/logout', 'POST', null, {
        'Authorization': `Bearer ${token}`
      });
      
      console.log(`   ✅ Logout: ${logout.status} - ${logout.body.success ? 'Success' : 'Failed'}`);
      
      if (logout.body.success) {
        console.log(`   📧 Message: ${logout.body.message}`);
      } else {
        console.log(`   ❌ Error: ${logout.body.error}`);
      }
    } else {
      console.log('   ❌ Could not get token for logout test');
    }
  } catch (error) {
    console.log(`   ❌ Logout failed: ${error.message}`);
  }

  console.log('\n🎉 Authentication Tests Complete!');
}

// Run the tests
testAuth().catch(console.error); 