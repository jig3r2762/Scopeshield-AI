export type RiskLevel = 'LIKELY_IN_SCOPE' | 'POSSIBLY_SCOPE_CREEP' | 'HIGH_RISK_SCOPE_CREEP'

export type ReplyType = 'POLITE_BOUNDARY' | 'PAID_ADDON' | 'NEGOTIATION_FRIENDLY'

export interface AnalysisResult {
  riskLevel: RiskLevel
  confidenceScore: number
  reasoning: string
}

export interface ReplyOption {
  type: ReplyType
  content: string
}

export interface FullAnalysisResult extends AnalysisResult {
  replies: ReplyOption[]
}

export interface ProjectContext {
  scopeSummary: string
  outOfScopeItems?: string | null
  contractText?: string | null
}
