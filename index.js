require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const cors    = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/hubspot', async (req, res) => {
  const userApiKey = req.headers['user-api-key'];
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
    if (method === 'get') {
      // Standard GET logic
      const axiosRes = await axios.get(`https://api.hubapi.com${endpoint}`, {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: body
      });
      return res.status(axiosRes.status).json(axiosRes.data);
    }

    // Pagination logic for POST search
    const combinedResults = [];
    let after = body.after || null;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.post(`https://api.hubapi.com${endpoint}`, {
        ...body,
        ...(after ? { after } : {})
      }, {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;

      if (Array.isArray(data.results)) {
        combinedResults.push(...data.results);
      }

      // Check for next page
      if (data.paging?.next?.after) {
        after = data.paging.next.after;
      } else {
        hasMore = false;
      }
    }

    return res.status(200).json({
      results: combinedResults,
      total: combinedResults.length
    });

  } catch (err) {
    console.error('HubSpot Error:', err.response?.data || err.message);
    const status = err.response?.status || 500;
    const payload = err.response?.data || { message: err.message };
    return res.status(status).json(payload);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Middleware running on port', process.env.PORT || 3000);
});
