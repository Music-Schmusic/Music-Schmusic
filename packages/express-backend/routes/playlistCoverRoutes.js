import { Router } from 'express';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

const router = Router();
const PROJECT = 'spotify-stat-ai';
const LOCATION = 'us-central1';
const MODEL = 'imagen-3.0-generate-002';

// POST /api/playlist-cover/generate
router.post('/generate', async (req, res) => {
  try {
    // 1) Read genres array from the request body
    const { genres } = req.body;
    if (!Array.isArray(genres) || genres.length === 0) {
      return res.status(400).json({ error: 'Missing genres array' });
    }

    // 2) Authenticate with Google using service-account JSON in env
    const credentials = JSON.parse(process.env.GAI_KEY);
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const { token } = await client.getAccessToken();

    console.log('🤖 Generating cover for genres:', genres);

    // 3) Build the dynamic prompt
    const prompt = `Generate a creative playlist cover image based on the genres: ${genres.join(', ')}.`;
    const body = {
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: '1:1' },
    };

    // 4) Call the Imagen REST endpoint
    const url =
      `https://${LOCATION}-aiplatform.googleapis.com/v1/` +
      `projects/${PROJECT}/locations/${LOCATION}` +
      `/publishers/google/models/${MODEL}:predict`;

    const aiResp = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 120_000,
    });

    console.log(
      '✅ Status',
      aiResp.status,
      'Payload keys:',
      Object.keys(aiResp.data)
    );

    // 5) Extract the Base64-encoded image
    const p = aiResp.data.predictions?.[0];
    const mimeType = p?.mimeType || 'image/png';
    const b64 = p?.bytesBase64Encoded;
    if (!b64) {
      return res.status(500).json({ error: 'No image data in response' });
    }

    // 6) Respond with a Data URI
    const dataUri = `data:${mimeType};base64,${b64}`;
    return res.json({ image: dataUri });
  } catch (err) {
    console.error('🌄 Imagen API error:', err);
    return res.status(500).json({ error: 'Internal AI error' });
  }
});

export default router;
