import React from 'react';
import './FavoriteGenreTile.css';
import Lottie from 'lottie-react';

// Import Lottie JSON files
import defaultAnim from '../lottie/default.json';
import metalAnim from '../lottie/metal.json';
import rockAnim from '../lottie/rock.json';
import edmAnim from '../lottie/edm.json';
import jazzAnim from '../lottie/jazz.json';
import countryAnim from '../lottie/country.json';
import punkAnim from '../lottie/punk.json';
import classicalAnim from '../lottie/classical.json';
import popAnim from '../lottie/pop.json';
import rapAnim from '../lottie/rap.json';

const genreAnimations = {
  rock: rockAnim,
  edm: edmAnim,
  jazz: jazzAnim,
  metal: metalAnim,
  country: countryAnim,
  punk: punkAnim,
  classical: classicalAnim,
  pop: popAnim,
  default: defaultAnim,
  hiphop: rapAnim,
};

const genreColors = {
  rock: '#ff4b4b',
  edm: '#7b61ff',
  jazz: '#f3c623',
  metal: '#a83279',
  indie: '#30e849',
  pop: '#ff69b4',
  country: '#ffa500',
  punk: '#fc0fc0',
  classical: '#ffdf00',
  default: '#8884d8',
  hiphop: '#4169e1',
};

const normalizeGenreKey = (genre) =>
  genre?.toLowerCase().replace(/[^a-z]/g, '') || 'default';

const genreSynonyms = {
  rock: [
    'rock',
    'alt',
    'alternative',
    'classic rock',
    'indie rock',
    'garage',
    'grunge',
  ],
  metal: ['metal', 'doom', 'black metal', 'death', 'hardcore'],
  edm: [
    'edm',
    'electronic',
    'house',
    'techno',
    'trance',
    'dubstep',
    'rave',
    'jungle',
    'beats',
    'break core',
  ],
  jazz: ['jazz', 'swing', 'bebop', 'fusion'],
  classical: ['classical', 'orchestral', 'baroque', 'symphony'],
  pop: ['pop', 'dance pop', 'synthpop', 'electropop', 'teen pop'],
  punk: ['punk', 'emo', 'hardcore punk', 'pop punk', 'ska'],
  country: ['country', 'americana', 'folk'],
  hiphop: ['hip hop', 'rap', 'trap', 'drill', 'boom bap'],
};

const getGenreMatch = (genre) => {
  const normalized = genre?.toLowerCase() || '';
  for (const key in genreSynonyms) {
    if (genreSynonyms[key].some((word) => normalized.includes(word))) {
      return key;
    }
  }
  return 'default';
};

const FavoriteGenreTile = ({ genre }) => {
  const matchedKey = getGenreMatch(genre);
  const animationData = genreAnimations[matchedKey];
  const glowColor = genreColors[matchedKey] || genreColors.default;

  return (
    <div
      className="favorite-genre-tile"
      style={{ boxShadow: `0 0 20px ${glowColor}` }}
    >
      <Lottie
        animationData={animationData}
        loop
        autoplay
        className="genre-lottie"
      />
      <h3>{genre || 'No data'}</h3>
      <p>Your vibe this week</p>
    </div>
  );
};

export default FavoriteGenreTile;
