import { env } from '$env/dynamic/private';
import { neon } from '@neondatabase/serverless';

const connectionString: string = env.DATABASE_URL;

const sql = neon(connectionString);
export { sql };
