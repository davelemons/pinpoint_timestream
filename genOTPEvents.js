const { v4: uuidv4 } = require('uuid');
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

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
} 

async function writeEvents() {
    console.log("Writing events");
    var records = [];
    
    //Fake some SMS Records
    for (let index = 0; index < 50; index++) {
        var randomCountry = Math.floor(Math.random() * 5) + 1;
        var fakeMessageID = uuidv4();
        var time = moment();
        console.log('randomCountry', randomCountry)
        dimensions = [
            {'Name': 'region', 'Value': 'us-east-1'},
            {'Name': 'az', 'Value': 'az1'},
            {'Name': 'event_type', 'Value': "_sms.buffered"},
            {'Name': 'app_id', 'Value': '9b21677b77f34d04b9e9aac5b9a27c11'},
            {'Name': 'message_id', 'Value': fakeMessageID},
            {'Name': 'iso_country_code', 'Value': fakeSMSData[randomCountry].iso_country_code},
        ];
        fakeSMSBuffered = {
            'Dimensions': dimensions,
            'MeasureName': 'price_in_millicents_usd',
            'MeasureValue': fakeSMSData[randomCountry].price_in_millicents_usd,
            'MeasureValueType': 'DOUBLE',
            'Time': time.valueOf().toString()
        };
        records.push(fakeSMSBuffered);

        dimensions = [
            {'Name': 'region', 'Value': 'us-east-1'},
            {'Name': 'az', 'Value': 'az1'},
            {'Name': 'event_type', 'Value': "tfa.received"},
            {'Name': 'app_id', 'Value': '9b21677b77f34d04b9e9aac5b9a27c11'},
            {'Name': 'message_id', 'Value': fakeMessageID},
            {'Name': 'iso_country_code', 'Value': fakeSMSData[randomCountry].iso_country_code},
        ];

        var simulatedDelaySeconds = randomIntFromInterval(100,600);

        fakeSMSConfirmed = {
            'Dimensions': dimensions,
            'MeasureName': 'event_count',
            'MeasureValue': '1',
            'MeasureValueType': 'BIGINT',
            'Time': time.add(simulatedDelaySeconds,'seconds').valueOf().toString()
        };
        records.push(fakeSMSConfirmed);

        //adding some jitter
        await sleep(simulatedDelaySeconds)
    }

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

writeEvents();