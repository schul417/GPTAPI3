require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const cors    = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/hubspot', async (req, res) => {
  const { endpoint, body } = req.body;
  console.log('endpoint', endpoint);
  console.log('body', body);

  if (!endpoint) {
    return res.status(400).json({
      error: 'Missing "endpoint" in request body.'
    });
  }

  const url = `https://api.hubapi.com${endpoint}`;
  const axiosConfig = {
    method: 'post',
    url,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    data: body               // use `data` for JSON payload
  };
  console.log('axiosConfig', axiosConfig);


  try {
    const response = await axios(axiosConfig);
    console.log('response', response)
  } catch (err) {
    console.error('HubSpot Error:', err.response?.data || err.message);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Middleware running on port', process.env.PORT || 3000);
});
