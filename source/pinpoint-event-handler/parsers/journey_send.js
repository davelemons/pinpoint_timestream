module.exports = {
    parseEvent: function(event, records) {
      console.log('Parsing journey_send...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }