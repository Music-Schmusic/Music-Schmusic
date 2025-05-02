// packages/express-backend/routes/playlistCoverRoutes.js
import express from 'express';
import { generatePlaylistCover } from '../imagen.js';

const router = express.Router();

/**
 * Dummy function to get top genres for a user.
 * In production, you’d calculate this from your listening data.
 */
async function getTopGenres(userId) {
  // Replace with a real query or aggregation based on the user's listening data.
  return ['Rock', 'Hip-Hop', 'Pop'];
}

router.post('/generate', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res
      .status(400)
      .json({ error: 'userId is required in the request body.' });
  }

  try {
    // Retrieve the user's top 3 genres.
    const genres = await getTopGenres(userId);
    // Build a prompt using these genres.
    const prompt = `Create a vibrant, modern playlist cover that captures the essence of ${genres.join(
      ', '
    )} music. Use bold colors and dynamic imagery.`;

    // Generate the image using Vertex AI.
    const response = await generatePlaylistCover(prompt);
    // The structure of the response depends on the API; assume response.predictions[0] holds the image data.
    const generatedImage = response.predictions && response.predictions[0];
    if (!generatedImage) {
      throw new Error('No image generated.');
    }
    res.json({ image: generatedImage });
  } catch (error) {
    console.error('Error generating playlist cover:', error);
    res.status(500).json({ error: 'Failed to generate playlist cover.' });
  }
});

export default router;
