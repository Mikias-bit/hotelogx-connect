const config = require('../../config/env');
const gmailPollingService = require('./GmailPollingService');

class EmailPollingScheduler {
  constructor() {
    this.timer = null;
    this.isRunning = false;
  }

  start() {
    if (!config.emailPolling.enabled) {
      console.log('[EmailPollingScheduler] Disabled. Set EMAIL_POLLING_ENABLED=true to enable local Gmail polling.');
      return;
    }

    if (this.timer) return;

    const intervalMs = Math.max(config.emailPolling.intervalSeconds, 15) * 1000;
    console.log(`[EmailPollingScheduler] Enabled. Polling Gmail every ${intervalMs / 1000}s.`);

    this.runOnce();
    this.timer = setInterval(() => this.runOnce(), intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async runOnce() {
    if (this.isRunning) {
      console.log('[EmailPollingScheduler] Previous poll still running. Skipping this tick.');
      return;
    }

    this.isRunning = true;
    try {
      const result = await gmailPollingService.pollConnectedMailboxes({
        maxResults: config.emailPolling.maxResults,
        awaitAutomation: true
      });

      const totals = result.results.reduce((acc, item) => {
        acc.fetched += item.fetched;
        acc.processed += item.processed;
        acc.failed += item.failed;
        return acc;
      }, { fetched: 0, processed: 0, failed: 0 });

      console.log(`[EmailPollingScheduler] Gmail poll complete. checked=${result.checkedIntegrations}, fetched=${totals.fetched}, processed=${totals.processed}, failed=${totals.failed}`);
    } catch (error) {
      console.error('[EmailPollingScheduler] Gmail poll failed:', error.message);
    } finally {
      this.isRunning = false;
    }
  }
}

module.exports = new EmailPollingScheduler();
