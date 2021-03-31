module.exports = {
    parseEvent: function(event, records, log) {
        log.trace('Parsing campaign_received_foreground...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }