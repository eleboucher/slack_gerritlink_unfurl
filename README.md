# Slack Gerrit's Links unfurl

Inspired from: https://github.com/slackapi/sample-app-unfurls

Get simply the status of the commit you link! 


## Set Up

You should start by [creating a Slack app](https://api.slack.com/slack-apps) and configuring it
to use the Events API. This sample app uses the
[Slack Event Adapter](https://github.com/slackapi/node-slack-events-api), where you can find some
configuration steps to get the Events API ready to use in your app.


### Event Subscription

Turn on Event Subscriptions for the Slack app. You must input and verify a Request URL, and the
easiest way to do this is to
[use a development proxy as described in the Events API module](https://github.com/slackapi/node-slack-events-api#configuration).
The application listens for events at the path `/slack/events`. For example, the Request URL may
look like `https://myappunfurlsample.ngrok.io/slack/events`.
Create a subscription to the team event `link_shared`. Add an app unfurl domain for "flickr.com".
Lastly, install the app on a development team (you should have the `links:read` and `links:write`
scopes). Once the installation is complete, note the OAuth Access Token.


## Environment

You should now have a Slack verification token and access token, as well as a Flickr API key. Clone
this application locally. Create a new file named `.env` within the directory and place these values
as shown:

```
SLACK_VERIFICATION_TOKEN=xxxxxxxxxxxxxxxxxxx
SLACK_CLIENT_TOKEN=xoxp-0000000000-0000000000-0000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

```

___

## What i learn

With this project i learn how to:
  - Use Nodejs
  - Use Rest API
  - Improve my JavaScript skills
