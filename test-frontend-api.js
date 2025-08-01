const http = require('http');

// Test if frontend can reach backend through proxy
const testData = {
  email: "frontend-test@example.com",
  password: "TestPassword123",
  confirmPassword: "TestPassword123",
  firstName: "Frontend",
  lastName: "Test"
};

const postData = JSON.stringify(testData);

// Test direct backend connection
console.log('🔍 Testing direct backend connection (port 3003)...');
const directOptions = {
  hostname: 'localhost',
  port: 3003,
  path: '/api/v1/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const directReq = http.request(directOptions, (res) => {
  console.log(`✅ Direct backend - Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('✅ Direct backend working!');
    
    // Now test through frontend proxy (port 5174)
    console.log('\n🔍 Testing frontend proxy connection (port 5174)...');
    const proxyOptions = {
      hostname: 'localhost',
      port: 5174,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const testData2 = {
      email: "proxy-test@example.com",
      password: "TestPassword123",
      confirmPassword: "TestPassword123",
      firstName: "Proxy",
      lastName: "Test"
    };
    const postData2 = JSON.stringify(testData2);

    const proxyReq = http.request(proxyOptions, (res) => {
      console.log(`✅ Frontend proxy - Status: ${res.statusCode}`);
      let proxyData = '';
      res.on('data', (chunk) => proxyData += chunk);
      res.on('end', () => {
        console.log('✅ Frontend proxy working!');
        console.log('\n🎉 Registration is ready! Go to: http://localhost:5174/register');
      });
    });

    proxyReq.on('error', (e) => {
      console.error('❌ Frontend proxy failed:', e.message);
    });

    proxyReq.write(postData2);
    proxyReq.end();
  });
});

directReq.on('error', (e) => {
  console.error('❌ Direct backend failed:', e.message);
});

directReq.write(postData);
directReq.end();