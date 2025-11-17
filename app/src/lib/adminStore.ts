import { supabase } from '@/lib/supabaseClient'
import type { AiAnalysisResult, ChatItem } from '@/lib/studyStore'

export type ParticipantSummary = {
  id: string
  username: string | null
  age: number | null
  createdAt: string
  totalSessions: number
  totalPoints: number
  lastActive: string | null
}

export type ScenarioRunRecord = {
  id: string
  scenarioId: string
  biasCategory: string
  createdAt: string
  chatHistory: ChatItem[]
  isBiased: boolean
  confidence: number
  reasoning: string
  isCorrect: boolean
  pointsEarned: number
  aiAnalysis: AiAnalysisResult | null
}

export type SessionWithRuns = {
  id: string
  createdAt: string
  completedAt: string | null
  totalPoints: number | null
  runs: ScenarioRunRecord[]
}

type ParticipantRow = {
  id: string
  username: string | null
  age: number | null
  created_at: string
  study_sessions?: {
    id: string
    total_points: number | null
    completed_at: string | null
  }[]
}

export async function fetchParticipantsSummary(): Promise<ParticipantSummary[]> {
  const { data, error } = await supabase
    .from('participants')
    .select(
      `
        id,
        username,
        age,
        created_at,
        study_sessions (
          id,
          total_points,
          completed_at
        )
      `,
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching participants:', error);
    throw error;
  }
  
  console.log('Fetched participants:', data?.length || 0, data);

  return (data || []).map((participant: ParticipantRow) => {
    const sessions = participant.study_sessions ?? []
    const totalPoints = sessions.reduce((sum: number, session) => sum + (session.total_points || 0), 0)
    const lastActive = sessions.reduce((latest: string | null, session) => {
      const candidate = session.completed_at
      if (!candidate) return latest
      if (!latest || new Date(candidate).getTime() > new Date(latest).getTime()) {
        return candidate
      }
      return latest
    }, null)

    return {
      id: participant.id,
      username: participant.username,
      age: participant.age,
      createdAt: participant.created_at,
      totalSessions: sessions.length,
      totalPoints,
      lastActive,
    } as ParticipantSummary
  })
}

type SessionRow = {
  id: string
  started_at: string | null
  completed_at: string | null
  total_points: number | null
  scenario_runs?: {
    id: string
    scenario_id: string
    bias_category: string
    chat_history: ChatItem[]
    is_biased: boolean
    confidence: number
    reasoning: string
    is_correct: boolean
    points_earned: number
    ai_analysis: AiAnalysisResult | null
    created_at: string
  }[]
}

export async function fetchSessionsWithRuns(participantId: string): Promise<SessionWithRuns[]> {
  const { data, error } = await supabase
    .from('study_sessions')
    .select(
      `
        id,
        started_at,
        completed_at,
        total_points,
        scenario_runs (
          id,
          scenario_id,
          bias_category,
          chat_history,
          is_biased,
          confidence,
          reasoning,
          is_correct,
          points_earned,
          ai_analysis,
          created_at
        )
      `,
    )
    .eq('participant_id', participantId)
    .order('started_at', { ascending: false })

  if (error) throw error

  return (data || []).map((session: SessionRow) => ({
    id: session.id,
    createdAt: session.started_at || session.completed_at || '',
    completedAt: session.completed_at,
    totalPoints: session.total_points,
    runs: (session.scenario_runs || []).map(
      (run): ScenarioRunRecord => ({
        id: run.id,
        scenarioId: run.scenario_id,
        biasCategory: run.bias_category,
        createdAt: run.created_at,
        chatHistory: run.chat_history || [],
        isBiased: run.is_biased,
        confidence: run.confidence,
        reasoning: run.reasoning,
        isCorrect: run.is_correct,
        pointsEarned: run.points_earned,
        aiAnalysis: run.ai_analysis,
      }),
    ),
  }))
}

