'use strict';

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
const user = ''; // insert user id from Dynamo Db

exports.handler = function (event, context, callback) {
    getPageNo(user,
        callback
    );
};

function getPageNo(userId, callback) {
    var params = {
        TableName: 'demo_db',
        Key: {
            "userId": userId
        }
    };

    docClient.get(params, function (err, data) {
        console.log(JSON.stringify(params, null, 2));
        if (err) {
            callback(null,err);
        } else {
            const obj = {
                pageNo: data.Item.pageNo
            };
            callback(null,obj);
        }
    });
}