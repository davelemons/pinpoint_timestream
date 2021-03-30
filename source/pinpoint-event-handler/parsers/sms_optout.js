module.exports = {
    parseEvent: function(event, records) {
      console.log('Parsing sms_optout...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }