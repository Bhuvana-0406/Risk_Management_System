import app from './app.js'; 
import connectDB from './db/connection.js'; 
import dotenv from 'dotenv';
import logger from './utils/winston.js'; 
dotenv.config();

const PORT = process.env.PORT || 5000; 
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
