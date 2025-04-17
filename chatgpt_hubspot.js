require('dotenv').config();
const axios = require('axios');

async function chatWithHubspot(prompt) {
  const chatRequest = {
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        type: "function",
        function: {
          name: "get_hubspot_contacts",
          parameters: {
            type: "object",
            properties: {
              limit: { type: "integer" }
            },
            required: ["limit"]
          }
        }
      }
    ],
    tool_choice: "auto"
  };

  // Step 1: Initial request to GPT
  const initialResponse = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    chatRequest,
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
  );

  const message = initialResponse.data.choices[0].message;

  // Check if GPT asked to call a tool
  if (message.tool_calls) {
    const toolCall = message.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);

    // Call middleware (your local Node server)
    const middlewareResponse = await axios.post('http://localhost:3000/hubspot', {
      endpoint: '/crm/v3/objects/contacts',
      params: { limit: args.limit }
    });

    const hubspotData = middlewareResponse.data;

    // Now, properly respond back to GPT with tool_call_id
    const finalResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [
          { role: "user", content: prompt },
          message,  // important: original GPT message with tool_calls
          {
            role: "tool",
            tool_call_id: toolCall.id, // THIS LINE IS CRUCIAL
            content: JSON.stringify(hubspotData)
          }
        ]
      },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
    );

    console.log(finalResponse.data.choices[0].message.content);

  } else {
    // If GPT didn't request a tool, just log its response
    console.log(message.content);
  }
}

chatWithHubspot("List my latest 5 contacts from HubSpot");
