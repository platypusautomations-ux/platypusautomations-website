export async function onRequest(context) {
  const url = new URL(context.request.url);
  const params = url.searchParams;

  params.set('api_key', context.env.SAM_API_KEY);

  const samUrl = `https://api.sam.gov/opportunities/v2/search?${params}`;

  const response = await fetch(samUrl);
  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
