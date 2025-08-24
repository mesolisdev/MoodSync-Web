import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import spotifyRouter from "./routes/spotify.js";

dotenv.config();

// ✅ Validación de variables de entorno requeridas
const requiredEnvVars = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Error: Faltan las siguientes variables de entorno requeridas:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Crea un archivo .env en la raíz del backend con estas variables.');
  console.error('   Consulta config.example.js para más información.');
  process.exit(1);
}

console.log('✅ Variables de entorno validadas correctamente');

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ 
    ok: true, 
    service: "moodsync-backend",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    spotify: {
      configured: !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET)
    }
  });
});

app.use("/api/spotify", spotifyRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend listo en http://localhost:${port}`);
});