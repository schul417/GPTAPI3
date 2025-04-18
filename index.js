require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/hubspot', async (req, res) => {
  const { endpoint, ...rest } = req.body;
  const hubspotPayload = rest.params || rest;

  const isSearchOrMutation = endpoint.includes('/search') || endpoint.includes('/batch') || endpoint.includes('/merge');
  const method = isSearchOrMutation ? 'post' : 'get';

  try {
    const response = await axios({
      method,
      url: `https://api.hubapi.com${endpoint}`,
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      ...(method === 'get' ? { params: hubspotPayload } : { data: hubspotPayload })
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


