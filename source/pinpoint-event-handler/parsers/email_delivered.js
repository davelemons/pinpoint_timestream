module.exports = {
  parseEvent: function(event, records, log) {
    log.trace('Parsing email_delivered...');
    var record = global.parseCommonEvents(event, records);

    //We have a processing time metric so write additional metric for the processing time
    if (event.facets.email_channel.mail_event.delivery && event.facets.email_channel.mail_event.delivery.processing_time_millis){
        const processingTime = {
            'Dimensions': record.Dimensions,
            'MeasureName': 'processing_time_millis',
            'MeasureValue': event.facets.email_channel.mail_event.delivery.processing_time_millis.toString(),
            'MeasureValueType': 'BIGINT',
            'Time': event.event_timestamp.toString()
        };
        records.push(processingTime);
    }
    
    records.push(record);
  }
}