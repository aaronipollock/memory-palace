// Clear rate limiting data
if (global.authAttempts) {
    global.authAttempts.clear();
    console.log('Rate limiting data cleared');
} else {
    console.log('No rate limiting data found');
}
