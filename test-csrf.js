const fetch = require('node-fetch');

const API_URL = 'http://localhost:5001';

async function testCSRF() {
    console.log('🧪 Testing CSRF Protection...\n');

    try {
        // Step 1: Login to get CSRF token
        console.log('1. Logging in to get CSRF token...');
        const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'demo@example.com',
                password: 'demo123456'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }

        const loginData = await loginResponse.json();
        console.log('✅ Login successful');
        console.log('   Access Token:', loginData.accessToken ? 'Present' : 'Missing');
        console.log('   CSRF Token:', loginData.csrfToken ? 'Present' : 'Missing');

        // Get cookies from response
        const cookies = loginResponse.headers.get('set-cookie');
        console.log('   Cookies:', cookies ? 'Present' : 'Missing');

        // Step 2: Test protected endpoint WITH CSRF token (should succeed)
        console.log('\n2. Testing protected endpoint WITH CSRF token...');
        const protectedResponse = await fetch(`${API_URL}/api/memory-palaces`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.accessToken}`,
                'X-CSRF-Token': loginData.csrfToken,
                'Cookie': cookies
            },
            body: JSON.stringify({
                name: 'Test Palace',
                roomType: 'throne room',
                associations: []
            })
        });

        console.log('   Status:', protectedResponse.status);
        if (protectedResponse.ok) {
            console.log('✅ Protected request WITH CSRF token succeeded');
        } else {
            const errorData = await protectedResponse.json();
            console.log('❌ Protected request failed:', errorData);
        }

        // Step 3: Test protected endpoint WITHOUT CSRF token (should fail)
        console.log('\n3. Testing protected endpoint WITHOUT CSRF token...');
        const unprotectedResponse = await fetch(`${API_URL}/api/memory-palaces`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.accessToken}`,
                'Cookie': cookies
            },
            body: JSON.stringify({
                name: 'Test Palace 2',
                roomType: 'throne room',
                associations: []
            })
        });

        console.log('   Status:', unprotectedResponse.status);
        if (unprotectedResponse.status === 403) {
            const errorData = await unprotectedResponse.json();
            console.log('✅ CSRF protection working - request blocked:', errorData.error);
        } else {
            console.log('❌ CSRF protection failed - request should have been blocked');
        }

        // Step 4: Test GET request (should succeed without CSRF token)
        console.log('\n4. Testing GET request (should not require CSRF token)...');
        const getResponse = await fetch(`${API_URL}/api/memory-palaces`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.accessToken}`,
                'Cookie': cookies
            }
        });

        console.log('   Status:', getResponse.status);
        if (getResponse.ok) {
            console.log('✅ GET request succeeded (no CSRF token required)');
        } else {
            console.log('❌ GET request failed unexpectedly');
        }

        console.log('\n🎉 CSRF Protection Test Complete!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCSRF();
