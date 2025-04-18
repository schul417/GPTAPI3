require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const cors    = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/hubspot', async (req, res) => {
  const userApiKey = req.headers['user-api-key'];

  // Check API key provided by user
  if (!userApiKey || userApiKey !== process.env.USER_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key.' });
  }

  console.log('📥 Incoming request:', req.body);
  const { endpoint, body } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing "endpoint" in request body.' });
  }
  
  const method = endpoint.endsWith('search') ? 'post' : 'get';

  try {
    const axiosRes = await axios({
      method: method,
      url: `https://api.hubapi.com${endpoint}`,
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: body
    });
    console.log('✅ HubSpot replied:', axiosRes.status, axiosRes.data);

    // send HubSpot’s response data back to the caller:
    return res
      .status(axiosRes.status)
      .json(axiosRes.data);
  } catch (err) {
    console.error('HubSpot Error:', err.response?.data || err.message);
    // forward HubSpot’s error (or a generic 500)
    const status = err.response?.status || 500;
    const payload = err.response?.data || { message: err.message };
    return res.status(status).json(payload);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Middleware running on port', process.env.PORT || 3000);
});
