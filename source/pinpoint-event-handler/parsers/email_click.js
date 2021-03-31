module.exports = {
  parseEvent: function(event, records, log) {
    log.trace('Parsing email_click...');
    var record = global.parseCommonEvents(event, records);
    records.push(record);
  }
}