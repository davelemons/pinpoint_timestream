module.exports = {
    parseEvent: function(event, records) {
      console.log('Parsing sms_failure...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }