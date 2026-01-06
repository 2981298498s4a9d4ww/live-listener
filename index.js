import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Example OpenMHz system (Chicago CPD)
const SYSTEMS = {
  chi_cpd: "https://openmhz.com/system/chi_cpd/live.m3u8"
};

app.get("/", (req, res) => {
  res.send("OpenMHz Proxy running");
});

// Proxy endpoint for HLS stream
app.get("/stream/:system", async (req, res) => {
  const system = req.params.system;
  const url = SYSTEMS[system];
  if (!url) return res.status(404).send("System not found");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://openmhz.com"
      }
    });

    if (!response.ok) return res.status(502).send("Stream not reachable");

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    response.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Stream offline");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
