const mongoose = require('mongoose');

const dbURl = 'mongodb://127.0.0.1:27017/CNNM';
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
