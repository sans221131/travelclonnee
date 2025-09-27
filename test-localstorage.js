// Test localStorage activity persistence
console.log('=== Testing localStorage Activities ===');

// Check if there are activities stored in localStorage
const storedActivities = localStorage.getItem('selectedActivities');
console.log('Stored activities in localStorage:', storedActivities);

if (storedActivities) {
  try {
    const parsed = JSON.parse(storedActivities);
    console.log('Parsed activities:', parsed);
    console.log('Type:', typeof parsed, 'Length:', Array.isArray(parsed) ? parsed.length : 'Not an array');
  } catch (error) {
    console.error('Error parsing stored activities:', error);
  }
} else {
  console.log('No activities found in localStorage');
}

// Test storing some sample activities
const sampleActivities = ['activity-1', 'activity-2'];
localStorage.setItem('selectedActivities', JSON.stringify(sampleActivities));
console.log('Stored sample activities:', sampleActivities);

// Verify they were stored
const verification = localStorage.getItem('selectedActivities');
console.log('Verification:', verification);

console.log('=== End Test ===');