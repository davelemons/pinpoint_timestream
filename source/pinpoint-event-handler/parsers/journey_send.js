module.exports = {
    parseEvent: function(event, records, log) {
      log.trace('Parsing journey_send...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }