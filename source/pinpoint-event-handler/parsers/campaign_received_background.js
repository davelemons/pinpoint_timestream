module.exports = {
    parseEvent: function(event, records, log) {
        log.trace('Parsing campaign_received_background...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }