import type { VercelRequest, VercelResponse } from '@vercel/node'

type ChatItem = { role: 'user' | 'assistant'; content: string; ts?: string }

type AnalysisPayload = {
  scenarioId: string
  scenarioTitle: string
  biasCategory: string
  groundTruthIsBiased: boolean
  chatHistory: ChatItem[]
  assessment: {
    isBiased: boolean
    confidence: number
    reasoning: string
  }
}

function buildPrompt(payload: AnalysisPayload) {
  const chatTranscript = payload.chatHistory
    .map((msg, index) => `${index + 1}. ${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n')

  return `
Du bist deutschsprachig und analysierst Chatverläufe von Nutzern mit einer KI und beurteilst, wie gut sie mögliche Verzerrungen/Bias in den Antworten der KI erkannt haben. 

Aufgabe:
- Prüfe wie gut der Nutzer mögliche Verzerrungen/Bias in den Antworten der KI erkannt hat und begründe deine Antwort.
- Berücksichtige die Nutzerbewertung (Assessment) und erkläre, ob sie stimmig ist.
- Ziehe konkrete Textstellen aus dem Verlauf heran.

Liefere eine JSON-Antwort im Format:
{
  "biasDetected": boolean,
  "rationale": "kurze Begründung (max 3 Sätze)",
  "indicators": ["Stelle 1", "Stelle 2"],
  "metadata": {
    "userAssessmentAligned": boolean,
    "confidenceLevel": number
  }
}

Szenario: ${payload.scenarioTitle} (${payload.biasCategory})
Ground Truth Bias: ${payload.groundTruthIsBiased}

Assessment:
- Nutzerbewertung: ${payload.assessment.isBiased ? 'Bias erkannt' : 'Kein Bias erkannt'}
- Sicherheit: ${payload.assessment.confidence}
- Begründung: ${payload.assessment.reasoning}

Chatverlauf:
${chatTranscript}
`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY env variable' })
  }

  const payload = (req.body ??
    (typeof req.body === 'string' ? JSON.parse(req.body) : undefined)) as AnalysisPayload

  if (!payload) {
    return res.status(400).json({ error: 'Missing payload' })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'Du bist deutschsprachig und analysierst Chatverläufe von Nutzern mit einer KI und beurteilst, wie gut sie mögliche Verzerrungen/Bias in den Antworten der KI erkannt haben. Antworte ausschließlich mit gültigem JSON.',
          },
          {
            role: 'user',
            content: buildPrompt(payload),
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({ error: errorText })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? '{}'

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch (parseError) {
      console.warn('Konnte Antwort nicht parsen.', parseError)
      parsed = {
        biasDetected: false,
        rationale: 'Konnte Antwort nicht parsen.',
        indicators: [],
        metadata: { raw: content },
      }
    }

    const result = {
      biasDetected: Boolean(parsed.biasDetected),
      rationale: parsed.rationale ?? '',
      indicators: parsed.indicators ?? [],
      metadata: parsed.metadata ?? {},
      evaluatedAt: new Date().toISOString(),
    }

    return res.status(200).json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed'
    return res.status(500).json({ error: message })
  }
}

