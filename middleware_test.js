const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:3000/hubspot', {
      endpoint: '/crm/v3/objects/contacts',
      params: { limit: 1 }
    });

    console.log(res.data);
  } catch (err) {
    console.error(err.response.data);
  }
})();