module.exports = {
    parseEvent: function(event, records, log) {
      log.trace('Parsing session_start...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }