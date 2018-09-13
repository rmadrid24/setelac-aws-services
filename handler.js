const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.dynamoHandler = (event, context, callback) => {
    const params = {
        TableName: 'Orders',
    };
    // fetch all todos from the database
    dynamoDb.scan(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: { 'Content-Type': 'text/plain' },
                body: 'Couldn\'t fetch the orders.',
            });
            return;
        }

        // create a response
        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        };
        callback(null, response);
    });
};

async function addOrder(order) {

    const params = {
        TableName: 'Orders',
        item: {
            ...order,
            timeSubmitted: new Date().toISOString()
        }
    };

    try {
        data = await dynamoDb.putItem(params).promise();
    }
    catch (err) {
        console.log(err);
        return err;
    }
    return data;
    // return dynamoDb.putItem(params).promise();
}

exports.graphqlHandler = (event, context, callback) => {
    switch (event.field) {
        case 'addOrder':
            const { order } = event.arguments;
            const params = {
                Item: {
                    ...order,
                    timeSubmitted: new Date().toISOString()
                },
                TableName: "Orders"
            };

            dynamoDb.put(params)
                .then((result) => {
                    callback(null, params.Item);
                })
                .catch(err => {
                    console.log('error', err);
                    callback(null, null);
                })
            // dynamoDb.put(params, (error, result) => {
            //     // handle potential errors
            //     console.log('data', error, result);
            //     if (error) {
            //         console.error(error);
            //         callback(null, null);
            //         return;
            //     }

            //     callback(null, params.Item);
            // });
            break;
        default:
            callback("Unknown field, unable to resolve" + event.field, null);
            break;
    }
};