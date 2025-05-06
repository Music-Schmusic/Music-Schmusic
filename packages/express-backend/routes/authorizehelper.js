async function spotifyFetch(url, authOptions) {
  const response = await fetch(url, authOptions);
  return response;
}

export default spotifyFetch;
