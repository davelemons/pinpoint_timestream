module.exports = {
    parseEvent: function(event, records, log) {
      log.trace('Parsing campaign_opened_notification...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }