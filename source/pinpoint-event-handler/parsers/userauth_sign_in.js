module.exports = {
    parseEvent: function(event, records, log) {
      log.trace('Parsing userauth_sign_in...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }