import {
  FullAnalysisResult,
  ProjectContext,
  ReplyOption,
  RiskLevel
} from './types'
import { analyzeWithGroq } from './groq-analyzer'

// Scope creep language patterns with weights
const SCOPE_CREEP_PATTERNS = [
  { pattern: /just\s+(a\s+)?small/i, weight: 0.3, reason: 'Uses minimizing language ("just a small...")' },
  { pattern: /quick\s+(little\s+)?change/i, weight: 0.35, reason: 'Uses minimizing language ("quick change")' },
  { pattern: /shouldn'?t\s+take\s+(long|much)/i, weight: 0.3, reason: 'Implies the work is trivial' },
  { pattern: /while\s+you'?re\s+at\s+it/i, weight: 0.4, reason: 'Adds work opportunistically ("while you\'re at it")' },
  { pattern: /can\s+you\s+also/i, weight: 0.25, reason: 'Requests additional work ("can you also")' },
  { pattern: /one\s+more\s+thing/i, weight: 0.35, reason: 'Adds scope incrementally ("one more thing")' },
  { pattern: /real\s+quick/i, weight: 0.3, reason: 'Minimizes effort with "real quick"' },
  { pattern: /simple\s+(tweak|change|fix)/i, weight: 0.3, reason: 'Uses "simple" to minimize perceived effort' },
  { pattern: /thought\s+(it|this)\s+was\s+included/i, weight: 0.4, reason: 'Assumes work was included in original scope' },
  { pattern: /didn'?t\s+we\s+(agree|discuss)/i, weight: 0.35, reason: 'Questions original agreement' },
  { pattern: /before\s+(we\s+)?launch/i, weight: 0.25, reason: 'Adds last-minute requirements before deadline' },
  { pattern: /urgent(ly)?/i, weight: 0.2, reason: 'Uses urgency to pressure' },
  { pattern: /asap|as\s+soon\s+as\s+possible/i, weight: 0.2, reason: 'Creates artificial urgency' },
  { pattern: /expected\s+this/i, weight: 0.35, reason: 'Claims unmet expectations' },
  { pattern: /assumed\s+(this|it)/i, weight: 0.35, reason: 'Makes assumptions about scope' },
  { pattern: /bonus|extra|additional/i, weight: 0.2, reason: 'Requests additional features' },
  { pattern: /new\s+feature/i, weight: 0.4, reason: 'Explicitly requests new feature' },
  { pattern: /add(ing)?\s+(a|some|new)/i, weight: 0.3, reason: 'Requests additions to scope' },
  { pattern: /complete(ly)?\s+(different|new)/i, weight: 0.45, reason: 'Requests significantly different work' },
  { pattern: /change\s+(the|our)\s+(direction|approach)/i, weight: 0.5, reason: 'Major direction change requested' },
  // Revision-abuse detection patterns
  { pattern: /all\s+pages?/i, weight: 0.4, reason: 'Affects all pages (site-wide change)' },
  { pattern: /every\s+page/i, weight: 0.4, reason: 'Affects every page (site-wide change)' },
  { pattern: /across\s+the\s+(site|website|app)/i, weight: 0.4, reason: 'Site-wide change requested' },
  { pattern: /throughout\s+(the|all)/i, weight: 0.35, reason: 'Global changes requested' },
  { pattern: /update\s+everything/i, weight: 0.45, reason: 'Broad "update everything" request' },
  { pattern: /apply\s+to\s+all/i, weight: 0.4, reason: 'Applies changes globally' },
  { pattern: /global\s+(change|update)/i, weight: 0.4, reason: 'Global changes requested' },
  { pattern: /changed\s+my\s+mind/i, weight: 0.35, reason: 'Reversal of previously approved work' },
  { pattern: /redo\s+(the|this)/i, weight: 0.4, reason: 'Requests to redo completed work' },
  { pattern: /start\s+over/i, weight: 0.5, reason: 'Requests to start work over' },
  { pattern: /completely\s+redesign/i, weight: 0.5, reason: 'Complete redesign request' },
  { pattern: /(fonts?|colors?|spacing|layout).*(and|,).*(fonts?|colors?|spacing|layout)/i, weight: 0.4, reason: 'Multiple design elements in one request' },
  // Compliance, security, regulatory patterns (HIGH_RISK)
  { pattern: /gdpr|ccpa|hipaa|compliance/i, weight: 0.5, reason: 'Introduces compliance/regulatory requirements' },
  { pattern: /security\s+(audit|review|requirements?)/i, weight: 0.45, reason: 'Introduces security requirements' },
  { pattern: /ssl|encryption|authentication/i, weight: 0.4, reason: 'Introduces security/infrastructure work' },
  { pattern: /legal\s+(requirements?|review)/i, weight: 0.45, reason: 'Introduces legal/regulatory expectations' },
  { pattern: /infrastructure|server|hosting|deployment/i, weight: 0.4, reason: 'Involves infrastructure work' }
]

// In-scope indicators
const IN_SCOPE_INDICATORS = [
  { pattern: /bug|error|issue|broken|not\s+working/i, weight: -0.2, reason: 'Reports a bug or issue' },
  { pattern: /as\s+(we\s+)?discussed/i, weight: -0.15, reason: 'References previous discussion' },
  { pattern: /per\s+the\s+(scope|contract|agreement)/i, weight: -0.3, reason: 'References agreed scope' },
  { pattern: /feedback|revision/i, weight: -0.1, reason: 'Standard feedback request' },
  { pattern: /question\s+about/i, weight: -0.15, reason: 'Asking for clarification' }
]

function calculateRiskScore(message: string, context: ProjectContext): { score: number; reasons: string[] } {
  let score = 0.5 // Start neutral
  const reasons: string[] = []
  const messageLower = message.toLowerCase()

  // Check scope creep patterns
  for (const { pattern, weight, reason } of SCOPE_CREEP_PATTERNS) {
    if (pattern.test(message)) {
      score += weight
      reasons.push(reason)
    }
  }

  // Check in-scope indicators
  for (const { pattern, weight, reason } of IN_SCOPE_INDICATORS) {
    if (pattern.test(message)) {
      score += weight
      reasons.push(reason)
    }
  }

  // Check against scope summary
  const scopeKeywords = context.scopeSummary.toLowerCase().split(/\s+/)
  const messageWords = messageLower.split(/\s+/)

  let scopeMatchCount = 0
  for (const word of messageWords) {
    if (word.length > 4 && scopeKeywords.includes(word)) {
      scopeMatchCount++
    }
  }

  if (scopeMatchCount > 3) {
    score -= 0.15
    reasons.push('Message content aligns with defined scope')
  }

  // Check against out-of-scope items
  if (context.outOfScopeItems) {
    const outOfScopeKeywords = context.outOfScopeItems.toLowerCase().split(/\s+/)
    let outOfScopeMatch = 0
    for (const word of messageWords) {
      if (word.length > 4 && outOfScopeKeywords.includes(word)) {
        outOfScopeMatch++
      }
    }
    if (outOfScopeMatch > 2) {
      score += 0.25
      reasons.push('Request appears to match explicitly out-of-scope items')
    }
  }

  // Clamp score between 0 and 1
  score = Math.max(0, Math.min(1, score))

  return { score, reasons }
}

function getRiskLevel(score: number): RiskLevel {
  if (score < 0.4) return 'LIKELY_IN_SCOPE'
  if (score < 0.65) return 'POSSIBLY_SCOPE_CREEP'
  return 'HIGH_RISK_SCOPE_CREEP'
}

function generateReasoning(riskLevel: RiskLevel, reasons: string[], score: number): string {
  const confidenceText = score > 0.8 ? 'high' : score > 0.5 ? 'moderate' : 'low'

  let intro = ''
  switch (riskLevel) {
    case 'LIKELY_IN_SCOPE':
      intro = 'This request appears to be within the defined project scope.'
      break
    case 'POSSIBLY_SCOPE_CREEP':
      intro = 'This request may extend beyond the original project scope.'
      break
    case 'HIGH_RISK_SCOPE_CREEP':
      intro = 'This request likely represents scope creep and may require additional discussion.'
      break
  }

  const reasonsList = reasons.length > 0
    ? `\n\nKey observations:\n${reasons.map(r => `- ${r}`).join('\n')}`
    : ''

  const disclaimer = '\n\nNote: This is an automated assessment. Please review the request carefully and use your professional judgment.'

  return `${intro}${reasonsList}\n\nConfidence level: ${confidenceText} (${Math.round(score * 100)}%)${disclaimer}`
}

function generateReplies(riskLevel: RiskLevel): ReplyOption[] {
  if (riskLevel === 'LIKELY_IN_SCOPE') {
    return []
  }

  const replies: ReplyOption[] = [
    {
      type: 'POLITE_BOUNDARY',
      content: `Thanks for the suggestion! This isn't included in the original scope, but I'd be happy to discuss adding it.`
    },
    {
      type: 'PAID_ADDON',
      content: `This would be an additional feature outside the current scope. I can share a quick estimate if you'd like to proceed.`
    },
    {
      type: 'NEGOTIATION_FRIENDLY',
      content: `We can include this as a paid add-on or adjust the timeline — let me know what works best for you.`
    }
  ]

  return replies
}

export async function analyzeMessage(
  message: string,
  context: ProjectContext
): Promise<FullAnalysisResult> {
  // Use Groq AI if API key is available
  if (process.env.GROQ_API_KEY) {
    try {
      return await analyzeWithGroq(message, context)
    } catch (error) {
      console.error('Groq analysis failed, falling back to pattern-based:', error)
      // Fall through to pattern-based analysis
    }
  }

  // Pattern-based fallback
  const { score, reasons } = calculateRiskScore(message, context)
  const riskLevel = getRiskLevel(score)
  const confidenceScore = Math.min(95, Math.round(score * 100))
  const reasoning = generateReasoning(riskLevel, reasons, score)
  const replies = generateReplies(riskLevel)

  return {
    riskLevel,
    confidenceScore,
    reasoning,
    replies
  }
}

// Export for future Anthropic API integration
export interface AIProvider {
  analyzeMessage(message: string, context: ProjectContext): Promise<FullAnalysisResult>
}

export const mockProvider: AIProvider = {
  analyzeMessage
}
