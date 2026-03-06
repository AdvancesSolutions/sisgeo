/**
 * SIGEO v2 - Conexão Aurora (DATABASE_URL ou Secrets Manager)
 * Se SECRET_ARN estiver definido, as credenciais vêm do AWS Secrets Manager em tempo real.
 * Caso contrário, usa DATABASE_URL (MySQL ou PostgreSQL).
 * Exporta query(sql, params) e init() (obrigatório quando usa SECRET_ARN).
 */

const url = process.env.DATABASE_URL || '';
const SECRET_ARN = process.env.SECRET_ARN || '';
const SECRET_DATABASE = process.env.SECRET_DATABASE || 'sigeo_db';

let pool;
let driver;

if (SECRET_ARN) {
  driver = 'mysql';
  pool = null;
} else if (/^mysql:\/\//i.test(url)) {
  const mysql = require('mysql2/promise');
  pool = mysql.createPool({
    uri: url,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  driver = 'mysql';
} else {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: url,
    ssl: url.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : false,
  });
  driver = 'pg';
}

/**
 * Inicializa o pool a partir do AWS Secrets Manager (obrigatório quando SECRET_ARN está definido).
 * Na EC2, use IAM Role com permissão secretsmanager:GetSecretValue.
 */
async function init() {
  if (pool) return;
  if (!SECRET_ARN) return;

  const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
  const mysql = require('mysql2/promise');
  const region = process.env.AWS_REGION || 'sa-east-1';
  const client = new SecretsManagerClient({ region });

  try {
    const response = await client.send(new GetSecretValueCommand({ SecretId: SECRET_ARN }));
    const secrets = JSON.parse(response.SecretString);

    pool = await mysql.createPool({
      host: secrets.host,
      user: secrets.username,
      password: secrets.password,
      database: secrets.dbname || SECRET_DATABASE,
      port: secrets.port || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('✅ Conectado ao Aurora RDS via Secrets Manager');
  } catch (err) {
    console.error('❌ Erro ao buscar segredos ou conectar ao banco:', err);
    process.exit(1);
  }
}

function toMysqlPlaceholders(sql) {
  return sql.replace(/\$\d+/g, '?');
}

async function query(sql, params = []) {
  if (driver === 'mysql') {
    if (!pool) throw new Error('DB não inicializado. Chame await db.init() antes de usar (SECRET_ARN).');
    const mysqlSql = toMysqlPlaceholders(sql);
    const hasReturning = /RETURNING\s+\*/i.test(sql);
    const isInsert = /^\s*INSERT\s+/i.test(sql.trim());

    if (isInsert && hasReturning) {
      const insertSql = mysqlSql.replace(/\s*RETURNING\s+\*\s*$/i, '');
      const [result] = await pool.execute(insertSql, params);
      const id = result.insertId;
      if (id == null) return { rows: [] };
      const tableMatch = sql.match(/INTO\s+(\w+)/i);
      const table = tableMatch ? tableMatch[1] : 'users';
      const [rows] = await pool.execute('SELECT * FROM ?? WHERE id = ?', [table, id]);
      return { rows: Array.isArray(rows) ? rows : [] };
    }

    const isUpdate = /^\s*UPDATE\s+/i.test(sql.trim());
    if (isUpdate && hasReturning) {
      const updateSql = mysqlSql.replace(/\s*RETURNING\s+\*\s*$/i, '');
      await pool.execute(updateSql, params);
      const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
      const idMatch = sql.match(/WHERE\s+id\s*=\s*\$\d+/i);
      const table = tableMatch ? tableMatch[1] : 'tasks';
      const idx = idMatch ? parseInt(idMatch[0].match(/\d+/)[0], 10) - 1 : params.length - 1;
      const id = params[idx];
      const [rows] = await pool.execute('SELECT * FROM ?? WHERE id = ?', [table, id]);
      return { rows: Array.isArray(rows) ? rows : [] };
    }

    const [rows] = await pool.execute(mysqlSql, params);
    return { rows: Array.isArray(rows) ? rows : [] };
  }

  const result = await pool.query(sql, params);
  return { rows: result.rows || [] };
}

module.exports = {
  query,
  init,
  pool,
  driver,
};
