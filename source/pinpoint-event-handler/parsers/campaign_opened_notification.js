module.exports = {
    parseEvent: function(event, records) {
      console.log('Parsing campaign_opened_notification...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }