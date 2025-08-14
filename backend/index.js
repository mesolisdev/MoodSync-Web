import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import spotifyRouter from "./routes/spotify.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "moodsync-backend" });
});

app.use("/api/spotify", spotifyRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend listo en http://localhost:${port}`);
});