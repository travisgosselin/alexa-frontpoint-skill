var frontpoint = require('./frontpoint');

/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `SessionSpeechlet - ${title}`,
            content: `SessionSpeechlet - ${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'Welcome to the FrontPoint security app. ' +
        'You can say things like "ARM" or "DISARM" to interact with your security system';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'You can say things like "ARM" or "DISARM" to interact with your security system';
    const shouldEndSession = false;

    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Thank you for using FrontPoint!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function arm(intent, session, callback) {
    const cardTitle = intent.name;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = true;
    let speechOutput = '';
    
    console.log('in arming...');

    const noEntryDelay = true;
    const silentArming = true;
    const command = 'armStay';
     console.log('Authenticating...')
     frontpoint
         .login(username, password)
         .then(res => {
             authOpts = res;
             return frontpoint.getCurrentState(res.systems[0], authOpts);
         })
         .then(res => {
            if (!res.partitions.length)
                return console.error('No security system partitions found');
    
            const partition = res.partitions[0]
            if (res.partitions.length > 1)
                console.warn(`Warning: multiple partitions found`);
             
             const msg =
                 command === 'armStay'
                 ? 'Arming (stay)'
                 : command === 'armAway' ? 'Arming (away)' : 'Disarming'
             console.log(`${msg} ${partition.attributes.description}...`)
            const opts = {
                noEntryDelay: noEntryDelay,
                silentArming: silentArming
            }
            const method = frontpoint[command]

            method(partition.id, authOpts, opts).then(res => {
                console.log('Armed Successfully.')
                speechOutput = "Security system ARMED!";
                callback({}, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            });
        })
        .catch(err => {
            console.error(err)
            speechOutput = "A problem ocurred ARMING the security system. You should arm it manually and ask Travis what the heck happened?";
            callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        });
}

function disarm(intent, session, callback) {
    const cardTitle = intent.name;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = true;
    let speechOutput = '';
    
    console.log('in arming...');

    const noEntryDelay = true;
    const silentArming = true;
    const command = 'disarm';
     console.log('Authenticating...')
     frontpoint
         .login(username, password)
         .then(res => {
             authOpts = res;
             return frontpoint.getCurrentState(res.systems[0], authOpts);
         })
         .then(res => {
            if (!res.partitions.length)
                return console.error('No security system partitions found');
    
            const partition = res.partitions[0]
            if (res.partitions.length > 1)
                console.warn(`Warning: multiple partitions found`);
             
             const msg =
                 command === 'armStay'
                 ? 'Arming (stay)'
                 : command === 'armAway' ? 'Arming (away)' : 'Disarming'
             console.log(`${msg} ${partition.attributes.description}...`)
            const opts = {
                noEntryDelay: noEntryDelay,
                silentArming: silentArming
            }
            const method = frontpoint[command]

            method(partition.id, authOpts, opts).then(res => {
                console.log('Disarmed Successfully.')
                speechOutput = "Security system Disarmed!";
                callback({}, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            });
        })
        .catch(err => {
            console.error(err)
            speechOutput = "A problem ocurred disarming the security system. You will just have to disarm it yourself I guess. Be sure to ask Travis what the heck happened?";
            callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        });;
}

// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    console.log('Intent name: ' + intentName);
    if (intentName === 'Arm') {
        arm(intent, session, callback);
    } else if (intentName === 'Disarm') {
        disarm(intent, session, callback);
    } else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw "Unknown intent name";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
