module.exports = {
    parseEvent: function(event, records) {
      console.log('Parsing sms_success...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }