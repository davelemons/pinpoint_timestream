module.exports = {
    parseEvent: function(event, records) {
      console.log('Parsing session_start...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }