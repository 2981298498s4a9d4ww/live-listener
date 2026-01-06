const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("OpenMHz Radio Backend running");
});

/*
  Usage:
  /radio?system=chi_cpd
*/

app.get("/radio", async (req, res) => {
  const { system } = req.query;

  if (!system) {
    return res.status(400).send("Missing system parameter");
  }

  // OpenMHz live stream endpoint
  const streamUrl = `https://openmhz.com/system/${system}/live`;

  try {
    const response = await fetch(streamUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok || !response.body) {
      return res.status(502).send("Stream not available");
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Pipe audio directly (ZERO buffering)
    response.body.pipe(res);

    // Cleanup if user disconnects
    req.on("close", () => {
      response.body.destroy();
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Backend error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
