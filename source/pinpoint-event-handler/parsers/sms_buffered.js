module.exports = {
    parseEvent: function(event, record, records, log) {
        log.trace('Parsing sms_buffered...');

        var smsBufferedCost = {
            'Dimensions': record.Dimensions,
            'MetricName': 'sms_cost',
            'Value': event.metrics.price_in_millicents_usd + '',
            'Unit': 'None',
            'StorageResolution':1,
            'Timestamp': event.event_timestamp.toString()
        };
        records.push(smsBufferedCost);

        var smsBufferedMPS = {
            'Dimensions': record.Dimensions,
            'MetricName': 'sms_message_parts',
            'Value': event.attributes.number_of_message_parts,
            'Unit': 'BIGINT',
            'StorageResolution':1,
            'Timestamp': event.event_timestamp.toString()
        };
        records.push(smsBufferedMPS);

        return record;
    }
  }