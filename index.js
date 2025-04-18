require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/hubspot', async (req, res) => {
  // Get endpoint + body from the JSON payload
  const endpoint = req.params.endpoint;
  const body = req.params.params;

  if (!endpoint) {
    return req //res.status(400).json({ error: 'Missing "endpoint" in request body.' });
  }

  const url = `https://api.hubapi.com${endpoint}`;
  const axiosConfig = {
    method: 'post',
    url,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    params: body
  };

  // Build a safe debug snapshot (no API key)
  const debugConfig = {
    method: axiosConfig.method,
    url:    axiosConfig.url,
    data:   axiosConfig.data
  };

  try {
    const response = await axios(axiosConfig);
    return res.json({
      debug:  debugConfig,
      result: response.data
    });
  } catch (err) {
    console.error('HubSpot Error:', err.response?.data || err.message);
    return res
      .status(err.response?.status || 500)
      .json({
        debug: debugConfig,
        error: err.response?.data || err.message
      });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Middleware running on port', process.env.PORT || 3000);
});
