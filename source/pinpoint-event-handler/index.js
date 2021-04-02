
const AWS = require('aws-sdk');
AWS.config.update({ region: "us-east-1" });
var https = require('https');
var requireDir = require('require-dir');
var dir = requireDir('./parsers');
var log = require('loglevel');
log.setLevel(process.env.LOG_LEVEL);
var agent = new https.Agent({
    maxSockets: 5000
});

const writeClient = new AWS.TimestreamWrite({
        maxRetries: 10,
        httpOptions: {
            timeout: 20000,
            agent: agent
        }
    });  

const parseCommonEvents = function(event, records){
    log.trace('parseGeneral Called!');
    
    //Standard Dimensions
    var dimensions = [
        {'Name': 'region', 'Value': process.env.AWS_REGION}
    ];

    //General
    if(event.event_type) dimensions.push({'Name': 'event_type', 'Value': event.event_type});
    if(event.awsAccountId) dimensions.push({'Name': 'awsAccountId', 'Value': event.awsAccountId});
    if(event.application) dimensions.push({'Name': 'app_id', 'Value': event.application.app_id});
    
    //Campaign
    if(event.attributes && event.attributes.campaign_id) dimensions.push({'Name': 'campaign_id', 'Value': event.attributes.campaign_id});
    if(event.attributes && event.attributes.campaign_activity_id) dimensions.push({'Name': 'campaign_activity_id', 'Value': event.attributes.campaign_activity_id});

    //Journeys
    if(event.attributes && event.attributes.journey_id) dimensions.push({'Name': 'journey_id', 'Value': event.attributes.journey_id});
    if(event.attributes && event.attributes.journey_activity_id) dimensions.push({'Name': 'journey_activity_id', 'Value': event.attributes.journey_activity_id});
    if(event.attributes && event.attributes.journey_activity_type) dimensions.push({'Name': 'journey_activity_type', 'Value': event.attributes.journey_activity_type});
    if(event.attributes && event.attributes.journey_send_status) dimensions.push({'Name': 'journey_send_status', 'Value': event.attributes.journey_send_status});

    //SMS
    if(event.attributes && event.attributes.origination_phone_number) dimensions.push({'Name': 'origination_phone_number', 'Value': event.attributes.origination_phone_number});
    if(event.attributes && event.attributes.iso_country_code) dimensions.push({'Name': 'iso_country_code', 'Value': event.attributes.iso_country_code});
    if(event.attributes && event.attributes.message_id) dimensions.push({'Name': 'message_id', 'Value': event.attributes.message_id});

    //Common Email Events
    if (event.facets && event.facets.email_channel && event.facets.email_channel.mail_event){
        //From Address:
        if(event.facets.email_channel.mail_event.mail.from_address) dimensions.push({'Name': 'from_address', 'Value': event.facets.email_channel.mail_event.mail.from_address});
        
        //MessageID:
        if(event.facets.email_channel.mail_event.mail.message_id) dimensions.push({'Name': 'message_id', 'Value': event.facets.email_channel.mail_event.mail.message_id});
    }

    return {
        'Dimensions': dimensions,
        'MeasureName': 'event_count',
        'MeasureValue': '1',
        'MeasureValueType': 'BIGINT',
        'Time': event.event_timestamp.toString()
    };
};

async function writeEvent(event, records) {
    log.trace("Writing event");
    var parser = event.event_type.replace('_','').replace('.','_').toLowerCase();

    var record = parseCommonEvents(event, records);

    //See if we have any special parsers.  The parser can enhance the existing record or if needed add 
    //additional metrics to the records collection.  For example the sms_buffered parser will add 2 additional metrics for cost and message parts
    //If you need to handle other events differently just add a parser to the folder matching the event name minus the initial underscore)
    if (typeof dir[parser] === 'object'){
        dir[parser].parseEvent(event, record, records, log);
    } 

    records.push(record);

}

exports.handler = async (event, context) => {
    log.info(`Received: ${event.records.length} records.`);
    log.debug('Received event:', JSON.stringify(event, null, 2));
    var records = [];
    var output = []; //will need to pass un-altered records back to Kinesis
    for (const record of event.records) {
        output.push({
            /* This transformation is the "identity" transformation, the data is left intact */
            recordId: record.recordId,
            result: 'Ok',
            data: record.data,
        });

        // Kinesis data is base64 encoded so decode here
        const payload = Buffer.from(record.data, 'base64').toString('ascii');
        log.trace('Decoded payload:', payload);

        await writeEvent(JSON.parse(payload), records);
    }

    const params = {
        DatabaseName: process.env.TIMESTREAM_DATABASE,
        TableName: process.env.TIMESTREAM_TABLE, //TODO: may want different tables for different events.
        Records: records
    };

    log.trace(JSON.stringify(records, null, 2));
 
    const promiseWithDuplicateRequest = writeClient.writeRecords(params);
    await promiseWithDuplicateRequest.promise().then(
        (data) => {
            log.debug("Write records successful");
        },
        (err, data) => {
            log.error("Error writing records:", err);

            //Get any rejected records
            const responsePayload = JSON.parse(promiseWithDuplicateRequest.response.httpResponse.body.toString());
            log.info("RejectedRecords: ", responsePayload.RejectedRecords);
            throw err;
        }
    );

    log.info(`Successfully processed ${event.records.length} records.`);
    return { records: output };
};
