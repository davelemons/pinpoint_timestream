/******
 * This just simulates SMS Sends and OTP Receipts from the Pinpoint Event stream into CloudWatch.  In reality something
 * like this would be in a Kinesis Lambda watching for the appropriate events in Pinpoint and pushing them into
 * CloudWatch.  Note that this is POC and work should be done to push the appropriate dimensions.
 */
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({ region: "us-east-1" });
var moment = require('moment');
const cloudwatch = new AWS.CloudWatch({region: 'us-east-1'});

var fakeSMSData = [
    {'iso_country_code':'US','price_in_millicents_usd':'0.00645'},
    {'iso_country_code':'BR','price_in_millicents_usd':'0.02297'},
    {'iso_country_code':'UK','price_in_millicents_usd':'0.03888'},
    {'iso_country_code':'JP','price_in_millicents_usd':'0.07451'},
    {'iso_country_code':'FR','price_in_millicents_usd':'0.06933'},
    {'iso_country_code':'ZA','price_in_millicents_usd':'0.01924'}
]

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
} 

async function writeEvents() {
    //console.log("Writing events");
    var records = [];


    
    //Fake some SMS Records
    for (let index = 0; index < 50; index++) {
        var randomCountry = Math.floor(Math.random() * 5) + 1;
        var fakeMessageID = uuidv4();
        randomCountryCode = fakeSMSData[randomCountry].iso_country_code
        var time = moment();
        

        // const metric = {
        //     MetricData: [ /* required */
        //       {
        //         MetricName: 'YOUR_METRIC_NAME', /* required */
        //         Dimensions: [
        //           {
        //             Name: 'URL', /* required */
        //             Value: url /* required */
        //           },
        //         /* more items */
        //         ],
        //         Timestamp: new Date(),
        //         Unit: 'Count',
        //         Value: SOME_VALUE
        //       },
        //       /* more items */
        //     ],
        //     Namespace: 'YOUR_METRIC_NAMESPACE' /* required */
        //   };

        dimensions = [
            {'Name': 'region', 'Value': 'us-east-1'},
            {'Name': 'az', 'Value': 'az1'},
            {'Name': 'event_type', 'Value': "_sms.buffered"},
            {'Name': 'app_id', 'Value': '9b21677b77f34d04b9e9aac5b9a27c11'},
            {'Name': 'message_id', 'Value': fakeMessageID},
            {'Name': 'iso_country_code', 'Value': randomCountryCode},
        ];
        fakeSMSBuffered = {
            'Dimensions': dimensions,
            'MetricName': '_sms.buffered',
            'Value': fakeSMSData[randomCountry].price_in_millicents_usd,
            'Unit': 'None',
            'StorageResolution':1,
            'Timestamp': time.toDate()
        };
        records.push(fakeSMSBuffered);

        dimensions = [
            {'Name': 'region', 'Value': 'us-east-1'},
            {'Name': 'az', 'Value': 'az1'},
            {'Name': 'event_type', 'Value': "tfa.received"},
            {'Name': 'app_id', 'Value': '9b21677b77f34d04b9e9aac5b9a27c11'},
            {'Name': 'message_id', 'Value': fakeMessageID},
            {'Name': 'iso_country_code', 'Value': randomCountryCode},
        ];

        var simulatedDelaySeconds = randomIntFromInterval(10,1000);

        fakeSMSConfirmed = {
            'Dimensions': dimensions,
            'MetricName': 'tfa.received',
            'Value': 1,
            'Unit': 'Count',
            'StorageResolution':1,
            'Timestamp': time.add(simulatedDelaySeconds,'seconds').toDate()
        };
        records.push(fakeSMSConfirmed);

        //adding some jitter
        await sleep(simulatedDelaySeconds)
        console.log('Wrote records for:' , randomCountryCode)
    }

    const params = {
        Namespace: "PinpointOTPEvents",
        MetricData: records
    };

    //console.log(records)
    
    const promise = cloudwatch.putMetricData(params).promise();
    
    await promise.then(
        (data) => {
            console.log("Write records successful");
        },
        (err) => {
            console.log("Error writing records:", err);
        }
    );
}

//Keep going till program is stopped.
async function eventSimulator() {
    while(true) {
        let res = await writeEvents()
        console.log('Wrote Events to Cloudwatch');
    };
}

eventSimulator();