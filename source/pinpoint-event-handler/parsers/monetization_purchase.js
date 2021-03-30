module.exports = {
    parseEvent: function(event, records) {
      console.log('Parsing monetization_purchase...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }