module.exports = {
    parseEvent: function(event, records) {
      console.log('Parsing email_rendering_failure...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }