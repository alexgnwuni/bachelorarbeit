import type { ChatItem, AiAnalysisResult } from '@/lib/studyStore'

export type AnalysisPayload = {
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

// For local dev: if vercel dev runs on port 3000, use that. Otherwise use relative path
const ANALYSIS_ENDPOINT =
  import.meta.env.VITE_ANALYSIS_ENDPOINT || 
  (import.meta.env.DEV ? 'http://localhost:3000/api/analyze' : '/api/analyze')

export async function analyzeScenarioRun(payload: AnalysisPayload): Promise<AiAnalysisResult> {
  const response = await fetch(ANALYSIS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Analysis API error (${response.status}): ${message}`)
  }

  const data = (await response.json()) as AiAnalysisResult
  return data
}

