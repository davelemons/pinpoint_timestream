module.exports = {
    parseEvent: function(event, records) {
      console.log('Parsing userauth_sign_in...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }