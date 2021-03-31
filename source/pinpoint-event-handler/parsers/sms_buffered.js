module.exports = {
    parseEvent: function(event, records, log) {
      log.trace('Parsing sms_buffered...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }