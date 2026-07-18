import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/winston.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' });

const morganMiddleware = morgan('combined', {
  stream: {
    write: (message) => {
      logger.info(message.trim());
      accessLogStream.write(message);
    },
  },
});

export default morganMiddleware;