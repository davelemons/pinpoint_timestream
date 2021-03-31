module.exports = {
    parseEvent: function(event, records, log) {
      log.trace('Parsing email_rendering_failure...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }