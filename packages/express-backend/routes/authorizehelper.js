async function spotifyFetch(authOptions) {
  const response = await fetch(authOptions.url, {
    method: authOptions.method,
    headers: authOptions.headers,
    body: authOptions.body,
  });
  return response;
}

export default spotifyFetch;
