module.exports = {
    parseEvent: function(event, records) {
      console.log('Parsing email_complaint...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }