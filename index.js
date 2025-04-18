require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

+ app.post('/hubspot', async (req, res) => {
     const payload = req.body.params || req.body;
     const { endpoint, body } = payload;

  // Determine HTTP method explicitly
  const method = endpoint.includes('/search') ? 'post' : 'get';

  // Axios config based on method
  const axiosConfig = {
    method,
    url: `https://api.hubapi.com${endpoint}`,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
      'Content-Type': 'application/json',
    },
   ...(method === 'get' && queryParams  ? { params: queryParams } : {}),
    ...(method === 'post' && body         ? { data: body         } : {}),
  };

  try {
    const response = await axios(axiosConfig);
    res.json(response.data);
  } catch (error) {
    console.error("HubSpot Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Middleware running on port", process.env.PORT || 3000);
});
