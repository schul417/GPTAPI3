require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/hubspot', async (req, res) => {
  // unwrap wrapper if needed
  const payload = req.body.params || req.body;
  const {
    endpoint,
    body,
    queryParams,
    method: overrideMethod,
    headers: customHeaders = {}
  } = payload;

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing "endpoint" in request body.' });
  }

  const method = (overrideMethod || (endpoint.includes('/search') ? 'post' : 'get'))
                   .toLowerCase();

  // build full axios config
  const axiosConfig = {
    method,
    url: `https://api.hubapi.com${endpoint}`,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
      'Content-Type': 'application/json',
      ...customHeaders
    },
    ...(method === 'get'   && queryParams ? { params: queryParams } : {}),
    ...(method !== 'get'   && body        ? { data:   body        } : {})
  };

  // strip out the auth header for debug visibility
  const { Authorization, ...otherHeaders } = axiosConfig.headers;
  const debugConfig = {
    method: axiosConfig.method,
    url:    axiosConfig.url,
    headers: otherHeaders, 
    ...(axiosConfig.params ? { params: axiosConfig.params } : {}),
    ...(axiosConfig.data   ? { data:   axiosConfig.data   } : {})
  };

  try {
    const response = await axios(axiosConfig);
    // send back both debug info and the real response
    res.json({
      debug:  debugConfig,
      result: response.data
    });
  } catch (err) {
    console.error('HubSpot Error:', err.response?.data || err.message);
    res
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
