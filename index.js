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
    const response = await axios.post(url, params, {  // ← Corrected placement!
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("HubSpot Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data || error.message 
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Middleware running on port", process.env.PORT || 3000);
});
