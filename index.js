
const AWS = require('aws-sdk');
AWS.config.update({ region: "us-east-1" });
var https = require('https');
var moment = require('moment');
var agent = new https.Agent({
    maxSockets: 5000
});

var fakeSMSData = [
    {'iso_country_code':'US','price_in_millicents_usd':'0.00645'},
    {'iso_country_code':'BR','price_in_millicents_usd':'0.02297'},
    {'iso_country_code':'UK','price_in_millicents_usd':'0.03888'},
    {'iso_country_code':'JP','price_in_millicents_usd':'0.07451'},
    {'iso_country_code':'FR','price_in_millicents_usd':'0.06933'},
    {'iso_country_code':'ZA','price_in_millicents_usd':'0.01924'}
]

const writeClient = new AWS.TimestreamWrite({
        maxRetries: 10,
        httpOptions: {
            timeout: 20000,
            agent: agent
        }
    });  

async function writeEvent(event) {
    console.log("Writing event");
    var records = [];

    //Standard Dimensions
    var dimensions = [
        {'Name': 'region', 'Value': process.env.AWS_REGION}
    ];
    if(event.event_type) dimensions.push({'Name': 'event_type', 'Value': event.event_type});
    if(event.awsAccountId) dimensions.push({'Name': 'awsAccountId', 'Value': event.awsAccountId});
    if(event.application) dimensions.push({'Name': 'app_id', 'Value': event.application.app_id});
    if(event.attributes && event.attributes.campaign_id) dimensions.push({'Name': 'campaign_id', 'Value': event.attributes.campaign_id});
    if(event.attributes && event.attributes.treatment_id) dimensions.push({'Name': 'treatment_id', 'Value': event.attributes.treatment_id});

    //Email Events
    if (event.facets && event.facets.email_channel && event.facets.email_channel.mail_event){

        //From Address:
        if(event.facets.email_channel.mail_event.mail.from_address) dimensions.push({'Name': 'from_address', 'Value': event.facets.email_channel.mail_event.mail.from_address});

        //We have a processing time metric so write additional metric for the processing time
        if (event.facets.email_channel.mail_event.delivery && event.facets.email_channel.mail_event.delivery.processing_time_millis){
            const processingTime = {
                'Dimensions': dimensions,
                'MeasureName': 'processing_time_millis',
                'MeasureValue': event.facets.email_channel.mail_event.delivery.processing_time_millis.toString(),
                'MeasureValueType': 'BIGINT',
                'Time': event.event_timestamp.toString()
            };
            records.push(processingTime);
        } 
    }

    var eventCount = {
        'Dimensions': dimensions,
        'MeasureName': 'event_count',
        'MeasureValue': '1',
        'MeasureValueType': 'BIGINT',
        'Time': event.event_timestamp.toString()
    };

    records.push(eventCount);
    
    //Fake some SMS Records
    var randomCountry = Math.floor(Math.random() * 5) + 1;
    console.log('randomCountry', randomCountry)
    dimensions = [
        {'Name': 'region', 'Value': 'us-east-1'},
        {'Name': 'az', 'Value': 'az1'},
        {'Name': 'event_type', 'Value': "_sms.buffered"},
        {'Name': 'app_id', 'Value': event.application.app_id},
        {'Name': 'message_id', 'Value': event.application.app_id},
        {'Name': 'iso_country_code', 'Value': fakeSMSData[randomCountry].iso_country_code},
    ];
    fakeSMS = {
        'Dimensions': dimensions,
        'MeasureName': 'price_in_millicents_usd',
        'MeasureValue': fakeSMSData[randomCountry].price_in_millicents_usd,
        'MeasureValueType': 'DOUBLE',
        'Time': event.event_timestamp.toString() //moment().valueOf().toString()
    };

    records.push(fakeSMS);
 
    const params = {
        DatabaseName: "PinpointEvents",
        TableName: "PinpointEvents", //TODO: may want different tables for different events.
        Records: records
    };

    console.log(records)
 
    const promise = writeClient.writeRecords(params).promise();
 
    await promise.then(
        (data) => {
            console.log("Write records successful");
        },
        (err) => {
            console.log("Error writing records:", err);
        }
    );
}

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    for (const record of event.Records) {
        // Kinesis data is base64 encoded so decode here
        const payload = Buffer.from(record.kinesis.data, 'base64').toString('ascii');
        console.log('Decoded payload:', payload);
        await writeEvent(JSON.parse(payload));
    }
    return `Successfully processed ${event.Records.length} records.`;
};
