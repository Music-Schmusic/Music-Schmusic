import { Router } from 'express';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const PROJECT = 'spotify-stat-ai';
const LOCATION = 'us-central1';
const MODEL = 'imagen-3.0-generate-002';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/generate', async (req, res) => {
  try {
    // 1) Load service acc
    const keyFile = path.join(
      __dirname,
      '../auth/spotify-stat-ai-8587b4801d2d.json'
    );
    console.log('→ loading credentials from', keyFile);

    const auth = new GoogleAuth({
      keyFilename: keyFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const { token } = await client.getAccessToken();

    // 2) Imagen REST endpoint
    const url =
      `https://${LOCATION}-aiplatform.googleapis.com/v1/` +
      `projects/${PROJECT}/locations/${LOCATION}` +
      `/publishers/google/models/${MODEL}:predict`;

    // 3) prompt + params
    const body = {
      instances: [
        {
          prompt:
            'Generate a creative playlist cover image based on the genres: bunny.',
        },
      ],
      parameters: { sampleCount: 1, aspectRatio: '1:1' },
    };

    // 4) call Imagen
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

    // 5) pull out the Base64 string & mimeType
    const p = aiResp.data.predictions?.[0];
    const mimeType = p?.mimeType || 'image/png';
    const b64 = p?.bytesBase64Encoded;
    if (!b64) {
      return res.status(500).json({ error: 'No image data in response' });
    }

    // 6) form a proper Data-URI
    const dataUri = `data:${mimeType};base64,${b64}`;
    return res.json({ image: dataUri });
  } catch (err) {
    console.error('🌄 Imagen API error:', err);
    return res.status(500).json({ error: 'Internal AI error' });
  }
});

export default router;
