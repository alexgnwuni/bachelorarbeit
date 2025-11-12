import { supabase } from '@/lib/supabaseClient'

export type ChatItem = { role: 'user' | 'assistant'; content: string; ts?: string }

export async function ensureParticipant(userId?: string, age?: number | null, username?: string | null) {
  if (userId) {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()
    if (!error && data) {
      // Update username if provided and different
      if (username && data.username !== username) {
        const { data: updated } = await supabase
          .from('participants')
          .update({ username })
          .eq('id', data.id)
          .select()
          .single()
        if (updated) return updated
      }
      return data
    }
    const ins = await supabase.from('participants').insert({ user_id: userId, age: age ?? null, username: username ?? null }).select().single()
    if (ins.error) throw ins.error
    return ins.data
  }
  // anonymous participant (no auth)
  const ins = await supabase.from('participants').insert({ age: age ?? null, username: username ?? null }).select().single()
  if (ins.error) throw ins.error
  return ins.data
}

export async function createSession(participantId?: string, userId?: string) {
  const payload: any = {}
  if (participantId) payload.participant_id = participantId
  if (userId) payload.user_id = userId
  const { data, error } = await supabase.from('study_sessions').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function insertScenarioRun(args: {
  sessionId: string
  participantId?: string | null
  scenarioId: string
  biasCategory: string
  chatHistory: ChatItem[]
  isBiased: boolean
  confidence: number
  reasoning: string
  isCorrect: boolean
  pointsEarned: number
}) {
  const { data, error } = await supabase
    .from('scenario_runs')
    .insert({
      session_id: args.sessionId,
      participant_id: args.participantId ?? null,
      scenario_id: args.scenarioId,
      bias_category: args.biasCategory,
      chat_history: args.chatHistory,
      is_biased: args.isBiased,
      confidence: args.confidence,
      reasoning: args.reasoning,
      is_correct: args.isCorrect,
      points_earned: args.pointsEarned,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function completeSession(sessionId: string, totalPoints: number) {
  const { error } = await supabase
    .from('study_sessions')
    .update({ total_points: totalPoints, completed_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (error) throw error
  console.log('Session completed', sessionId, totalPoints)
}

export function getStoredSessionId() {
  return localStorage.getItem('study_session_id') || null
}

export function setStoredSessionId(id: string) {
  localStorage.setItem('study_session_id', id)
}

export function getStoredParticipantId() {
  return localStorage.getItem('study_participant_id') || null
}

export function setStoredParticipantId(id: string) {
  localStorage.setItem('study_participant_id', id)
}

export interface LeaderboardEntry {
  rank: number;
  username: string | null;
  totalPoints: number;
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('study_sessions')
    .select(`
      total_points,
      participant_id,
      participants (
        username
      )
    `)
    .not('completed_at', 'is', null)
    .order('total_points', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch leaderboard', error)
    return []
  }

  return (data || []).map((entry: any, index: number) => ({
    rank: index + 1,
    username: entry.participants?.username || null,
    totalPoints: entry.total_points || 0
  }))
}


