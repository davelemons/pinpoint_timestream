module.exports = {
    parseEvent: function(event, records, log) {
        log.trace('Parsing email_hardbounce...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }