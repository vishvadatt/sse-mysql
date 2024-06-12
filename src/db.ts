import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "local_database",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function* fetchDataInChunk(chunkSize: number) {
  let offset = 0;
  let results: any[] = [];
  const [rows] = await pool.execute(`select count(*) as count from users`);
  const totalRows = (rows as any)[0].count;

  console.log("++++++++++++++ TOTAL ROWS +++++++++++++", totalRows);

  while (true) {
    const [rows] = await pool.execute(
      `SELECT * FROM users LIMIT ${chunkSize} OFFSET ${offset}`
    );
    const data = rows as any[];
    if (data.length === 0) break;
    yield data;
    offset += chunkSize;
  }
}

export async function getTotalRecordCount() {
  const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM users`);
  const count = (rows as any[])[0].count;
  return count;
}
export default pool;
