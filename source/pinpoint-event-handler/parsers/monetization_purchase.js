module.exports = {
    parseEvent: function(event, records, log) {
    log.trace('Parsing monetization_purchase...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }