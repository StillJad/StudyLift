export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: 'Missing GEMINI_API_KEY on server.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const prompt = String(body?.prompt || '').trim();
    const model = String(body?.model || 'gemini-2.5-flash').trim();

    if (!prompt) {
      return Response.json(
        { error: 'Prompt is required.' },
        { status: 400 }
      );
    }

    if (prompt.length > 2000) {
      return Response.json(
        { error: 'Prompt too long.' },
        { status: 400 }
      );
    }

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    'You are a helpful study assistant for O Levels and similar exams. Keep answers short, clear, and exam-focused. Do not ramble unless the user asks for detail.\n\nStudent question: ' +
                    prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 180
          }
        })
      }
    );

    const text = await upstream.text();

    return new Response(text, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Gemini route error:', error);

    return Response.json(
      {
        error: 'Could not reach Gemini.',
        detail: error?.message || 'Unknown error.'
      },
      { status: 502 }
    );
  }
}
