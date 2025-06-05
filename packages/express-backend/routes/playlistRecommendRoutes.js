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
    const { genres } = req.body;
    if (!Array.isArray(genres) || genres.length < 1) {
      return res.status(400).json({ error: 'Missing or invalid genres' });
    }

    console.log(
      '🎯 Gemini recommendation triggered manually with genres:',
      genres
    );

    const prompt = `
      Based on these top genres: ${genres.join(', ')}, recommend 5 different music artists.
      For each artist, list 2 songs that best represent their style.
      Return the response as a JSON array with this structure:

      [
        {
          "artist": "Artist Name",
          "songs": [
            { "title": "Song 1", "spotifyUrl": "..." },
            { "title": "Song 2", "spotifyUrl": "..." },
            ...
          ]
        },
        ...
      ]
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    let text =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

    // ✅ Strip markdown (```json ... ```) if present
    if (text.startsWith('```')) {
      text = text.replace(/```json|```/g, '').trim();
    }

    let recommendations;
    try {
      recommendations = JSON.parse(text);
    } catch (err) {
      console.warn('⚠️ Failed to parse AI response. Raw text:', text);
      recommendations = [];
    }

    res.json({ recommendations });
  } catch (err) {
    console.error('Gemini recommendation error:', err);
    res.status(500).json({ error: 'Recommendation generation failed' });
  }
});

export default router;
