/**
 * Test script for date/time handling improvements
 * Run with: node test-datetime.js
 */

const testMessages = [
  // Basic date/time tests
  "Can we schedule an appointment for tomorrow at 2pm?",
  "I need to book next Thursday at 10am",
  "Schedule me for Monday morning",
  "Book an appointment for January 20th at 3:30pm",
  "Can you fit me in next week?",
  "I'd like an appointment in 3 days",
  
  // Relative dates
  "How about the day after tomorrow?",
  "Can we meet this Friday afternoon?",
  "Schedule for next Monday at noon",
  "Book me for the 15th at 4pm",
  
  // Time variations
  "Tomorrow at 14:00",
  "Next Tuesday 3:45 PM",
  "Wednesday morning around 9",
  "Thursday evening, maybe 5:30?",
  
  // Complex requests
  "I need to reschedule from tomorrow to next week same time",
  "Cancel my Thursday appointment and book for Monday instead",
  "What times are available next Tuesday?",
  "Do you have any openings this week?",
  
  // Edge cases
  "Can we meet at midnight?",
  "How about 6am tomorrow?",
  "Schedule for December 31st",
  "Book me for next month",
];

console.log("🧪 Date/Time Test Messages for Chat API\n");
console.log("Test these messages with different personas to verify date/time handling:\n");

testMessages.forEach((msg, index) => {
  console.log(`${index + 1}. "${msg}"`);
});

console.log("\n📋 Expected Behavior:");
console.log("- ALL personas should understand date/time references");
console.log("- Appointment Setter should be especially precise");
console.log("- Dates should be converted to specific format (e.g., 'Tuesday, January 21, 2025')");
console.log("- Times should be clear (e.g., '2:30 PM')");
console.log("- Business hours should be respected (9 AM - 5 PM by default)");
console.log("- Past dates should be questioned or rejected");

console.log("\n🚀 Test via API:");
console.log("curl -X POST http://localhost:8787/api/chat \\");
console.log("  -H 'Content-Type: application/json' \\");
console.log("  -d '{");
console.log('    "message": "Schedule an appointment for next Thursday at 10am",');
console.log('    "persona_id": "appointment-setter",');
console.log('    "use_knowledge_base": false');
console.log("  }'");

console.log("\n✅ Success Criteria:");
console.log("1. Natural language dates are correctly understood");
console.log("2. Specific dates/times are provided in responses");
console.log("3. No hardcoded limitations (not just Thursday/10am)");
console.log("4. All personas can handle temporal references");
console.log("5. Appointment Setter excels at scheduling tasks");