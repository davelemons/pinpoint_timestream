module.exports = {
    parseEvent: function(event, records, log) {
      log.trace('Parsing userauth_auth_fail...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }