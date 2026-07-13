export const logger = {
  logEvent(type, data) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] EVENT: ${type}`, JSON.stringify(data, null, 2));
    // In production, this would write to a DB or logging service like ELK/Datadog
  }
};
