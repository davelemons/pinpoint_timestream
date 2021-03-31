module.exports = {
    parseEvent: function(event, records, log) {
      log.trace('Parsing session_pause...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }