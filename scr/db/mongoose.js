const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mongoose = require("mongoose");

let uri;

if (process.env.DB_USERNAME && process.env.DB_PASSWORD) {
    const username = encodeURIComponent(process.env.DB_USERNAME);
    const password = encodeURIComponent(process.env.DB_PASSWORD);
    const clusterUrl = encodeURIComponent(process.env.DB_CLUSTER_URL);
    const dbName = encodeURIComponent(process.env.DB_NAME);
    uri = `mongodb+srv://${username}:${password}@${clusterUrl}/${dbName}?retryWrites=true&w=majority`;
} else {
    uri = `mongodb://${process.env.DB_CLUSTER_URL}/${process.env.DB_NAME}`;
}
mongoose.connect
    (
        uri,
        {}
    ).catch(error =>
    {
        if (error.name === 'MongooseServerSelectionError')
        {
            console.error("Database connection failed: IP not registered");
        } 
        else if (error.code === 'ECONNREFUSED')
        {
            console.error("Database connection failed: The connection was refused by the server. Ensure that the MongoDB server is running and accessible.");
        } else if (error.code === 'EREFUSED')
        {
            console.error("Database connection failed: The DNS query was refused. This is likely due to DNS server issues or misconfiguration.");
        } else
        {
            console.error("Database connection failed:", error);
        }
        process.exit(1); // Optionally exit the process if unable to connect
    });

// will keep listening to the events and throw error if any during the entire connection process
mongoose.connection.on('error', err =>
{
    console.error('Mongoose connection error:', err);
});

// to check only once if the connection is "open"
mongoose.connection.once('open', () =>
{
    console.log('Connected to MongoDB successfully!');
});