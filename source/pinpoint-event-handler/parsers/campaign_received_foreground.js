module.exports = {
    parseEvent: function(event, records) {
      console.log('Parsing campaign_received_foreground...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }