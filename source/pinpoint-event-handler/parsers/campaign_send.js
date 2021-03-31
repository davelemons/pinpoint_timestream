module.exports = {
    parseEvent: function(event, records, log) {
        log.trace('Parsing campaign_send...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }