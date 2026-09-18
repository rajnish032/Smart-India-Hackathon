import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const configDirectory = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(configDirectory, '../../.env') });