require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/hubspot', async (req, res) => {
  const { endpoint, params } = req.body;
  const url = `https://api.hubapi.com${endpoint}`;
  
  try {
    const response = await axios.post(url, {
      params,
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("HubSpot Error:", error.response.data);
    res.status(500).json({ error: error.response.data });
  }
});

app.listen(3000, () => {
  console.log("Middleware running on port 3000");
});
