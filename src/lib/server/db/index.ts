import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';

export const db = mysql.createPool(env.MYSQL_URL);
