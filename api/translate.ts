// /api/translate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { text, source = 'pl', target = 'en' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }

  const prompt = `Translate this from ${source} to ${target}:\n\n"${text}"`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content?.trim();

    res.status(200).json({ translation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Translation failed' });
  }
}
