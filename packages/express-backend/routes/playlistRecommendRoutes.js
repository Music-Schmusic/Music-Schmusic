import { Router } from 'express';
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';

const router = Router();
const PROJECT = 'spotify-stat-ai';
const LOCATION = 'us-central1';
const MODEL = 'gemini-2.5-flash-preview-05-20';

// Initialize Vertex AI
const auth = new GoogleAuth({
  credentials: JSON.parse(process.env.GAI_KEY),
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});
const vertexAI = new VertexAI({
  project: PROJECT,
  location: LOCATION,
  googleAuthOptions: { credentials: JSON.parse(process.env.GAI_KEY) },
});
const model = vertexAI.getGenerativeModel(
  { model: MODEL },
  { timeout: 120_000 }
);

// POST /api/playlist-recommendations/generate
router.post('/generate', async (req, res) => {
  try {
    // Static prompt for now
    const prompt =
      'Recommend a playlist of 5 songs based on these favorite genres: rock, hip hop, metal. ' +
      'Return a JSON array of objects with keys: title, artist, spotifyUrl.';

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    let recommendations;
    try {
      recommendations = JSON.parse(text);
    } catch {
      // fallback if model returned plain text
      recommendations = [];
    }

    res.json({ recommendations });
  } catch (err) {
    console.error('Gemini recommendation error:', err);
    res.status(500).json({ error: 'Recommendation generation failed' });
  }
});

export default router;
