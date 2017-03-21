'use strict';

const appId = "";  //update with alexa skill id

exports.handler = function (event, context) {
    try {

        if (event.session.application.applicationId !== appId) {
            context.fail("Invalid Application ID");
        }

        if (event.request.type === "IntentRequest") {
            onIntent(event.request, event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });

        } else if (event.request.type === "SessionEndedRequest") {
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

function onIntent(intentRequest, session, callback) {
    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;

    if (intentName == 'NextSlideIntent') {
        handleNextSlideRequest(intent, session, callback);
    }
    else if (intentName == 'PreviousSlideIntent') {
        handlePreviousSlideRequest(intent, session, callback);
    }
    else {
        throw "Invalid intent";
    }
}

function handleNextSlideRequest(intent, session, callback) {
    addPageNo(session.user.userId, function () {
        callback(session.attributes, buildSpeechResponse("Updating to the next slide", true));
    });
}

function handlePreviousSlideRequest(intent, session, callback) {
    subtractPageNo(session.user.userId, function () {
        callback(session.attributes, buildSpeechResponse("Updating to the previous slide", true));
    });
}

function subtractPageNo(userId, callback) {
    console.log("update database to previous page now");
    callback();

}
function addPageNo(userId, callback) {
    console.log("update database to next page now");
    callback();

}
function buildSpeechResponse(output, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: ""
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}