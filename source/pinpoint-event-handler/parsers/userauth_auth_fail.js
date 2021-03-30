module.exports = {
    parseEvent: function(event, records) {
      console.log('Parsing userauth_auth_fail...');
      var record = global.parseCommonEvents(event, records);
      records.push(record);
    }
  }