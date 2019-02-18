require('dotenv').config()

const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()),
  https = require('https'),
  fs = require('fs');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_LETSENCRYPT, 'utf8');
const certificate = fs.readFileSync(process.env.CERTIFICATE, 'utf8');
const ca = fs.readFileSync(process.env.CA, 'utf8');
const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
};

let orderByDistance = require('./src/orderByDistance')
let createMessageElements = require('./src/createMessageElements')
let eventLocations = require('./utils/eventLocations')

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(443, () => {
       console.log('HTTPS Server running on port 443');
});
app.post('/webhook', (req, res) => {  

  let body = req.body;

  if (body.object === 'page') {

    body.entry.forEach(function(entry) {

      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      
      let sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message)
      }
      else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback)
      }
    })
      res.status(200).send('EVENT_RECEIVED');

  } else {
      res.sendStatus(404);
  }

});

app.get('/webhook', (req, res) => {
  
  const VERIFY_TOKEN = "Mona";
  
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  if (mode && token) {
  
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      res.sendStatus(403);      
    }
  }
});

function handleMessage(sender_psid, received_message) {
  
  let responseLocalisation = {
  "text": "J'ai besoin de ta localisation",
    "quick_replies":[
      {
        "content_type":"location"
      }
    ]
  }
  
  if (received_message.text === 'JabJab') {
    console.log('user sent JabJab')
    callSendAPI(sender_psid, responseLocalisation)
  }
  if (received_message.attachments) {
   
    let latitude = null
    let longitude = null
    let array
    const userLocationObject = { latitude: 0, longitude: 0 }

    if(received_message.attachments[0].payload.coordinates) {
      
      let response
      const userLocation = Object.create(userLocationObject)
      
      latitude = received_message.attachments[0].payload.coordinates.lat
      longitude = received_message.attachments[0].payload.coordinates.long
      
      userLocation.latitude = latitude
      userLocation.longitude = longitude
      console.log(eventLocations.eventLocations) 
      orderedByDistanceObject = orderByDistance.orderByDistance(userLocation, eventLocations)
      elements = createMessageElements.createMessageElements(orderedByDistanceObject)
      
      response = {
        "attachment":{
	  "type":"template",
	    "payload":{
	      "template_type":"generic",
	      "elements": elements
	    }
	}
      }	
      callSendAPI(sender_psid, response)
      console.log(orderedByDistanceObject)
    }

  }

}

function handlePostback(sender_psid, received_postback) {
  let response
  let payload = received_postback.payload
  
  if (payload === 'USER_DEFINED_PAYLOAD') {
    response = { "text": "Envoie moi:  \"JabJab\" et je te dirais où trouver un événement au plus près de ta position." }
  }
  callSendAPI(sender_psid, response)
}

function callSendAPI(sender_psid, response) {
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}
