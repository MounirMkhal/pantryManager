import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    const recipes = response.data.choices[0].text.trim().split('\n');
    res.status(200).json({ recipes });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error: 'Error generating recipes' });
  }
}
