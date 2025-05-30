/**
 * Test script to verify user registration and 2FA setup
 */

const testUserFlow = async () => {
  console.log("🧪 Testing User Registration and 2FA Flow...\n");

  try {
    // Test data
    const testUser = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "TestPassword123!",
    };

    console.log("1. Testing user registration...");

    const registrationResponse = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(testUser),
      }
    );

    if (registrationResponse.ok) {
      const regData = await registrationResponse.json();
      console.log("✅ Registration successful");
      console.log(`   User ID: ${regData.user.id}`);
      console.log(`   Email: ${regData.user.email}\n`);

      // Test 2FA setup
      console.log("2. Testing 2FA setup...");
      const twoFAResponse = await fetch("http://localhost:5000/api/2fa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (twoFAResponse.ok) {
        const twoFAData = await twoFAResponse.json();
        console.log("✅ 2FA setup initiated");
        console.log(`   QR Code generated: ${twoFAData.qrCode ? "Yes" : "No"}`);
        console.log(
          `   Manual key provided: ${twoFAData.manualEntryKey ? "Yes" : "No"}\n`
        );
      } else {
        const errorData = await twoFAResponse.json();
        console.log("❌ 2FA setup failed");
        console.log(`   Error: ${errorData.message}\n`);
      }
    } else {
      const errorData = await registrationResponse.json();
      console.log("❌ Registration failed");
      console.log(`   Error: ${errorData.message}\n`);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

// Run the test
testUserFlow();
