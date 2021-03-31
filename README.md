# Pinpoint/SES Events to Timestream to Grafana [WIP]
This is a rough POC to see if we can stream [Amazon Pinpoint](https://aws.amazon.com/pinpoint/) (and SES?) events into [Timestream](https://aws.amazon.com/timestream/) to be visualized with Grafana or [Amazon Quicksight](https://aws.amazon.com/quicksight/)

## Instructions
- Create S3 Bucket to hold build artifacts
- `aws cloudformation package --template template.yaml --s3-bucket [Bucket Name From Above] --output yaml --output-template-file packaged-template.yaml`
- `aws cloudformation deploy --template-file packaged-template.yaml --stack-name pinpoint-timestream --capabilities CAPABILITY_IAM`
- Run Grafana.  Use AWS Managed Grafana, Run Locally (See Below), or use Hosted Grafana
- Connect to Timestream: https://grafana.com/grafana/plugins/grafana-timestream-datasource/ 

## Running Grafana Locally

- [Install Docker](https://www.docker.com/products/docker-desktop)
- Copy Isengard bash/zsh Temporary Credentials into container shell.  This sets temporary creds for Grafana to connect.  Note this is really only good for Demo/POC purposes.  Ideally want to stand this up on Fargate, connect to RDS so configs can be retained.
- Launch Docker `docker run -d -p 3000:3000 --name=grafana -e "GF_INSTALL_PLUGINS=grafana-timestream-datasource" --env ISENGARD_PRODUCTION_ACCOUNT --env AWS_ACCESS_KEY_ID --env AWS_SECRET_ACCESS_KEY --env AWS_SESSION_TOKEN grafana/grafana` 
- Login to Grafana: http://localhost:3000  UN/PW: admin/admin.  It will immediatly ask you to reset password.
- [Configure Timestream Datasource](https://grafana.com/grafana/plugins/grafana-timestream-datasource)
- Auth Provider: AWS SDK Default (will use the env variables passed into docker run command)
- Credentials Profile Name: leave blank
- Default Region: Select your region: US-East-1
- Test your connection and you should be able to see Timestream Databases and Tables.
- Create Dashboard from `SampleGrafanaDashboards/PinpointEventsDashboard.json`

## Scratchpad
SELECT DISTINCT iso_country_code FROM "PinpointEvents"."PinpointEvents" WHERE event_type = '_sms.buffered'