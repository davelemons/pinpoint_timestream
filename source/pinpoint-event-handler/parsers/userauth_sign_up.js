module.exports = {
    parseEvent: function(event, records, log) {
      log.trace('Parsing userauth_sign_up...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }