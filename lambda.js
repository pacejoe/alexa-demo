'use strict';

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

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

    if (intentName == 'StartIntent') {
        handleStartRequest(intent, session, callback);
    }
    else if (intentName == 'NextSlideIntent') {
        handleNextSlideRequest(intent, session, callback);
    }
    else if (intentName == 'PreviousSlideIntent') {
        handlePreviousSlideRequest(intent, session, callback);
    }
    else {
        throw "Invalid intent";
    }
}


function handleStartRequest(intent, session, callback) {
    resetPageNo(session.user.userId, function () {
        callback(session.attributes, buildSpeechResponse("Starting from the first slide", true));
    });
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


function resetPageNo(userId, callback) {
    var query = {
        TableName: 'demo_db',
        Item: {
            "userId": userId,
            "pageNo": 0
        }
    };

    docClient.put(query, function (err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
        callback();
    });


}

function subtractPageNo(userId, callback) {

    var query = {
        TableName: 'demo_db',
        Key: {
            "userId": userId
        },
        UpdateExpression: "set pageNo = pageNo - :val",
        ExpressionAttributeValues: {
            ":val": 1
        },
        ReturnValues: "UPDATED_NEW"
    };

    docClient.update(query, function (err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Item:", JSON.stringify(data, null, 2));
        }
        callback();
    });

}
function addPageNo(userId, callback) {

    var query = {
        TableName: 'demo_db',
        Key: {
            "userId": userId
        },
        UpdateExpression: "set pageNo = pageNo + :val",
        ExpressionAttributeValues: {
            ":val": 1
        },
        ReturnValues: "UPDATED_NEW"
    };

    docClient.update(query, function (err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Item:", JSON.stringify(data, null, 2));
        }
        callback();
    });
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