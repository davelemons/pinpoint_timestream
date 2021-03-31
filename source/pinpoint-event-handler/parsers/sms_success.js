module.exports = {
    parseEvent: function(event, records, log) {
      log.trace('Parsing sms_success...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }