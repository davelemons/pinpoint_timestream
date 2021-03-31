module.exports = {
  parseEvent: function(event, records, log) {
    log.trace('Parsing email_open...');
    var record = global.parseCommonEvents(event, records);
    records.push(record);
  }
}