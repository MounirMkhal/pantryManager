import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getOpenAIResponse(prompt) {
  const maxRetries = 3;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const response = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o-mini",
      });

      if (response && response.choices && response.choices.length > 0) {
        return response.choices[0].message.content;
      } else {
        throw new Error('Unexpected response format from OpenAI');
      }
    } catch (error) {
      if (error.status === 429) {
        attempts += 1;
        const delay = attempts * 1000; // Exponential backoff
        console.log(`Rate limit exceeded. Retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }

  // Fallback response when maximum retry attempts are exceeded
  return 'Sorry, we are unable to generate recipes at this moment. Please try again later.';
}

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    console.log('prompt:', prompt);

    const recipeContent = await getOpenAIResponse(prompt);
    console.log('Recipe content:', recipeContent);

    return new Response(JSON.stringify({ recipes: recipeContent }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error generating recipes:", error);

    // Log the detailed error response if available
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    }

    return new Response(JSON.stringify({ error: 'Failed to generate recipes' }), {
      status: error.status || 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
