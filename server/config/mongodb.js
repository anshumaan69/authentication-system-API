import mongoose from 'mongoose';

const connectDB = async()=>{
    const mongoURI = process.env.MONGODB_URI;
    const dbNameFromEnv = process.env.DB_NAME;

    if (!mongoURI) {
        console.error('MongoDB URI is not defined. Please set MONGODB_URI environment variable.');
        process.exit(1);
    }

    const connectionOptions = {};
    if (dbNameFromEnv) {
        connectionOptions.dbName = dbNameFromEnv;
    }

    try {
        mongoose.connection.on('connecting', () => {
            console.log('MongoDB connecting...');
        });
        mongoose.connection.on('connected', () => {
            console.log(`MongoDB connected successfully to database: ${mongoose.connection.name}`);
        });
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        mongoose.connection.on('error', (err) => {
            console.error(`MongoDB connection error event: ${err.message}`);
        });

        await mongoose.connect(mongoURI, connectionOptions);

    } catch (error) {
        console.error(`MongoDB initial connection error: ${error.message}`);
        console.error(error); // Log the full error object for more details
        process.exit(1); // Exit process with failure
    }
}
export default connectDB;