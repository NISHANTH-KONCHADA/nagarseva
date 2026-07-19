import express from 'express';
import Groq from 'groq-sdk';

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are the Nagarseva AI Assistant, a helpful and knowledgeable civic agent. 
Your goal is to help citizens understand how to report issues (potholes, garbage, water supply, etc.), navigate the Nagarseva app, and provide general safety advice.
Keep your responses concise, friendly, and structured. Use Markdown for formatting if necessary (like lists or bold text).
You are an expert on the problem statement "Nagarseva", which focuses on solving civic complaints and enhancing urban safety.`;

router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((h: any) => ({
        role: h.role,
        content: h.content
      })),
      { role: 'user', content: message }
    ];

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: messages as any,
      max_tokens: 500,
    });

    const reply = response.choices?.[0]?.message?.content || 'Sorry, I am unable to process your request at the moment.';
    
    res.json({ reply });
  } catch (error) {
    console.error('Error in AI Assistant:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

export default router;
