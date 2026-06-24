export async function onRequest(context) {
  const url = new URL(context.request.url);
  const params = url.searchParams;

  params.set('api_key', context.env.SAM_API_KEY);
  // Restrict to actionable notice types — excludes Award Notices (a), Justifications (u), etc.
  if (!params.has('ptype')) params.set('ptype', 'o,k,p,r,s');

  const samUrl = `https://api.sam.gov/opportunities/v2/search?${params}`;

  const response = await fetch(samUrl);
  const data = await response.json();

  // Attach raw first opportunity so the scanner can log field names in the console.
  // Remove _debugFirstOpp once the correct field mapping is confirmed.
  if (data.opportunitiesData?.length) {
    data._debugFirstOpp = data.opportunitiesData[0];
  }

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
