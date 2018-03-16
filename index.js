require('dotenv').config()
const slackEventsAPI = require('@slack/events-api')
const { WebClient } = require('@slack/client')
// Initialize a Slack Event Adapter for easy use of the Events API
// See: https://github.com/slackapi/node-slack-events-api
const slackEvents = slackEventsAPI.createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN)
var request = require('sync-request')
const keyBy = require('lodash.keyby')
const omit = require('lodash.omit')
const mapValues = require('lodash.mapvalues')

// Initialize a Web Client
const slack = new WebClient(process.env.SLACK_CLIENT_TOKEN)

const port = process.env.PORT || 3000

function messageAttachmentFromLink(link) {
  var query = 0
  var apilink = link.url
  var regex1 = new RegExp('.[a-z]*/[0-9]*$|.[a-z]*/[0-9]*/$')
  var regex2 = new RegExp('/c/')
  console.log({ apilink })
  if (regex2.test(apilink.toString())) {
    apilink = apilink.toString().replace('/c/', 'changes/')
  } else if (regex1.test(apilink.toString())) {
    var regex3 = new RegExp('/$')
    if (regex3.test(apilink.toString())) {
      apilink = apilink.toString().replace('/$', '')
    }
    var lastIndex = apilink.toString().lastIndexOf('/')
    apilink = apilink.toString().substr(0, lastIndex) + '/changes' + apilink.toString().substr(lastIndex)
  } else {
    query = 1
  }

  console.log('link:' + apilink.toString())
  var res = request('GET', apilink.toString())
  var body = res.getBody('utf8')
  body = body.replace(")]}'", '')

  var attachment = {
    title: link.url,
    url: link.url,
    color: '#36a64f'
  }

  if (query === 0) {
    var result = JSON.parse(body)
    var userlink = apilink.toString().replace('changes/', 'accounts/' + result['owner']['_account_id'] + '/name/')
    var user = request('GET', userlink)
    var username = user
      .getBody('utf8')
      .replace(")]}'", '')
      .replace(/\n/g, '')
      .replace(/\"/g, '')
    if (result.status === 'NEW') {
      var colorn = '#439FE0'
    } else if (result.status === 'MERGED') {
      var colorn = 'good'
    } else {
      var colorn = 'danger'
    }

    attachment = {
      title: result.subject,
      url: link.url,
      title_link: link.url,
      text: 'Project: ' + result.project + ' (' + result.branch + ')',
      color: colorn,
      footer: 'Status: ' + result.status + ' \tOwner: ' + username
    }
  }

  console.log(attachment)
  return attachment
}

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('link_shared', event => {
  // Call a helper that transforms the URL into a promise for an attachment suitable for Slack
  Promise.all(event.links.map(messageAttachmentFromLink))
    // Transform the array of attachments to an unfurls object keyed by URL
    .then(attachments => keyBy(attachments, 'url'))
    .then(unfurls => mapValues(unfurls, attachment => omit(attachment, 'url')))
    // Invoke the Slack Web API to append the attachment
    .then(unfurls => slack.chat.unfurl(event.message_ts, event.channel, unfurls))
    .catch(console.error)
})

// Handle errors
const slackEventsErrorCodes = slackEventsAPI.errorCodes
slackEvents.on('error', error => {
  if (error.code === slackEventsErrorCodes.TOKEN_VERIFICATION_FAILURE) {
    console.warn(`An unverified request was sent to the Slack events request URL: ${error.body}`)
  } else {
    console.error(error)
  }
})

// Start a basic HTTP server
slackEvents.start(port).then(() => {
  console.log(`server listening on port ${port}`)
})
