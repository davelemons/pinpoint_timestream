module.exports = {
    parseEvent: function(event, records) {
      console.log('Parsing campaign_received_background...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }