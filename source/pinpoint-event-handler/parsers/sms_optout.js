module.exports = {
    parseEvent: function(event, records, log) {
      log.trace('Parsing sms_optout...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }