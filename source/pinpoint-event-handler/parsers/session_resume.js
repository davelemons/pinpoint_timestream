module.exports = {
    parseEvent: function(event, records) {
      console.log('Parsing session_resume...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }