module.exports = {
  parseEvent: function(event, records) {
    console.log('Parsing email_click...');
    var record = global.parseCommonEvents(event, records);
    records.push(record);
  }
}