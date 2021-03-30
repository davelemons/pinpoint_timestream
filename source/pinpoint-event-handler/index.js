
const AWS = require('aws-sdk');
AWS.config.update({ region: "us-east-1" });
var https = require('https');
var moment = require('moment');
var requireDir = require('require-dir');
var dir = requireDir('./parsers');
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

global.parseCommonEvents = function(event, records){
    console.log('parseGeneral Called!');
    
    //Standard Dimensions
    var dimensions = [
        {'Name': 'region', 'Value': process.env.AWS_REGION}
    ];

    if(event.event_type) dimensions.push({'Name': 'event_type', 'Value': event.event_type});
    if(event.awsAccountId) dimensions.push({'Name': 'awsAccountId', 'Value': event.awsAccountId});
    if(event.application) dimensions.push({'Name': 'app_id', 'Value': event.application.app_id});
    if(event.attributes && event.attributes.campaign_id) dimensions.push({'Name': 'campaign_id', 'Value': event.attributes.campaign_id});
    if(event.attributes && event.attributes.treatment_id) dimensions.push({'Name': 'treatment_id', 'Value': event.attributes.treatment_id});

    //Common Email Events
    if (event.facets && event.facets.email_channel && event.facets.email_channel.mail_event){
        //From Address:
        if(event.facets.email_channel.mail_event.mail.from_address) dimensions.push({'Name': 'from_address', 'Value': event.facets.email_channel.mail_event.mail.from_address});

        //TODO: add common attributes for email.
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
    console.log("Writing event");
    var parser = event.event_type.replace('_','').replace('.','_');

    if (typeof dir[parser] === 'object'){
        dir[parser].parseEvent(event, records);
    } else {
        console.log(`An event parser for ${event.event_type} was not found.`);
    }

}

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    var records = [];
    for (const record of event.Records) {
        // Kinesis data is base64 encoded so decode here
        const payload = Buffer.from(record.kinesis.data, 'base64').toString('ascii');
        console.log('Decoded payload:', payload);
        await writeEvent(JSON.parse(payload), records);
    }

    const params = {
        DatabaseName: "PinpointEvents",
        TableName: "PinpointEvents", //TODO: may want different tables for different events.
        Records: records
    };

    console.log(records);
 
    const promise = writeClient.writeRecords(params).promise();
 
    await promise.then(
        (data) => {
            console.log("Write records successful");
        },
        (err) => {
            console.log("Error writing records:", err);
        }
    );

    return `Successfully processed ${event.Records.length} records.`;
};
