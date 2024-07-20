const mongoose = require('mongoose');
// require('dotenv').config()

const dbURl = 'mongodb+srv://imamw7428:' + process.env.MONGODB_URI + '@cluster0.cggzxjr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/CNNM';
mongoose.connect(dbURl);
const readLine = require('readline')

mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${dbURl}`);
});

mongoose.connection.on('error', err => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

const gracefulShutdown = async (msg) => {
    try {
        await mongoose.connection.close();
        console.log(`Mongoose disconnected through ${msg}`);
    } catch (error) {
        console.error(`Error during mongoose disconnection: ${error}`);
    }
};

process.once('SIGUSR2', async () => {
    await gracefulShutdown('nodemon restart');
    process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', async () => {
    await gracefulShutdown('app termination');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await gracefulShutdown('Heroku app shutdown');
    process.exit(0);
});

require('./projects');  // Ensure this file exists and is error-free

console.log("Starting the application...");


//this was created with the help of ChatGPT
