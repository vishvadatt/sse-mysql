import express, { Request, Response } from "express";
const app = express();
import { listDat } from "./list";
import pool, { fetchDataInChunk, getTotalRecordCount } from "./db";
import path from "path";

app.get("/data", async (req: Request, res: Response) => {
  const insertPromises = listDat.map((element) => {
    return pool.execute(
      `insert into users(id, title, url, thumbnailUrl, albumId) values(?, ?, ?, ?, ?)`,
      [
        element.id,
        element.title,
        element.url,
        element.thumbnailUrl,
        element.albumId,
      ]
    );
  });
  await Promise.all(insertPromises);
  res.send("You have completed insert all data");
});
app.use(express.static(path.join(__dirname, "../public")));

app.get("/stream-data", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const chunkSize = 1000;
  for await (const chunk of fetchDataInChunk(chunkSize)) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }

  // Send completion message
  res.write(`event: done\ndata: {"message": "All data has been sent"}\n\n`);
  res.end();
});

app.get("/total-records", async (req, res) => {
  try {
    const totalRecords = await getTotalRecordCount();
    res.json({ totalRecords });
  } catch (error) {
    res.status(500).json({ error: "Failed to get total record count" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
