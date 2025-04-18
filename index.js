require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/hubspot', async (req, res) => {
  // Support both direct calls and GPT-style wrapper
  const payload = req.body.params || req.body;

  const {
    endpoint,
    body,            // for POST/PUT/PATCH/etc.
    queryParams,     // for GET
    method: overrideMethod,
    headers: customHeaders = {}
  } = payload;

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing "endpoint" in request body.' });
  }

  // Allow an explicit override, otherwise search endpoints => POST, all else => GET
  const method = (overrideMethod || (endpoint.includes('/search') ? 'post' : 'get'))
                   .toLowerCase();

  // Build the axios config
  const axiosConfig = {
    method,
    url: `https://api.hubapi.com${endpoint}`,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
      'Content-Type': 'application/json',
      ...customHeaders
    },
    // Attach query params for GET (or any non-body methods, if you like)
    ...(method === 'get' && queryParams     ? { params: queryParams } : {}),
    // Attach body for non-GET
    ...(method !== 'get' && body             ? { data: body }         : {})
  };

  try {
    const response = await axios(axiosConfig);
    res.json(response.data);
  } catch (err) {
    console.error('HubSpot Error:', err.response?.data || err.message);
    res
      .status(err.response?.status || 500)
      .json({ error: err.response?.data || err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Middleware running on port', process.env.PORT || 3000);
});
