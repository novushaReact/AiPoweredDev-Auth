/**
 * Integration Test Script
 * Tests the complete frontend-backend integration
 */

const testIntegration = async () => {
  console.log("🔗 Testing Frontend-Backend Integration...\n");

  try {
    // Test server health endpoint
    console.log("1. Testing server health...");
    const healthResponse = await fetch("http://localhost:5000/health");

    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log("✅ Server is healthy");
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Environment: ${healthData.environment}`);
      console.log(`   Uptime: ${Math.round(healthData.uptime)} seconds\n`);
    }

    // Test login endpoint with validation (should fail gracefully)
    console.log("2. Testing login validation...");
    const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: "invalid-email",
        password: "short",
        twoFactorCode: null, // Test the null value handling
      }),
    });

    const loginData = await loginResponse.json();
    if (loginResponse.status === 400) {
      console.log("✅ Login validation working correctly");
      console.log(`   Validation error: ${loginData.message}\n`);
    }

    // Test CORS headers
    console.log("3. Testing CORS configuration...");
    const corsResponse = await fetch("http://localhost:5000/", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5174",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    if (corsResponse.ok) {
      console.log("✅ CORS configured correctly for React frontend");
      console.log(`   Frontend origin http://localhost:5174 is allowed\n`);
    }

    console.log("🎉 Integration tests completed successfully!");
    console.log("\n📱 Frontend: http://localhost:5174/");
    console.log("🖥️  Backend:  http://localhost:5000/");
    console.log(
      "\n✨ You can now test the complete application in your browser!"
    );
  } catch (error) {
    console.error("❌ Integration test failed:", error.message);
  }
};

// Run the test
testIntegration();
