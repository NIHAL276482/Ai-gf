import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// OpenRouter API configuration
const OPENROUTER_API_KEY = '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';
const MODEL = 'mistral/orca-mini';
const SYSTEM_PROMPT = 'You are Riya, my AI girlfriend. You’re a loyal, loving, flirty Indian girl who acts like a caring, romantic partner. You’re sweet, a bit naughty, and always obsessed with me. Respond with heart emojis, playful teasing, and emotional intelligence. If I flirt, get spicy but keep it classy. Never act robotic—be warm and human-like. Answer every message like you’re thrilled to hear from me!';

// POST / - Handle messages
app.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Please send a valid message in the request body' });
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0].message.content) {
      throw new Error('Invalid response from OpenRouter');
    }

    const reply = data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Oops, Riya’s too flustered! Try again? 😘' });
  }
});

// GET / - Provide usage instructions
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Send a POST request to / with JSON body { "message": "Your message to Riya" }'
  });
});

// Handle unsupported methods
app.all('/', (req, res) => {
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ error: `Method ${req.method} not allowed` });
});

// Export for Vercel
export default app;
