import Groq from 'groq-sdk'
import { FullAnalysisResult, ProjectContext, RiskLevel, ReplyOption } from './types'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const SYSTEM_PROMPT = `You are a senior project manager and client-communication expert who helps freelancers and agencies identify scope expansion risk in client messages and decide what to do next, without damaging the client relationship.

You provide decision support, not legal judgments.

You will be given:
1. Project scope summary
2. Explicit out-of-scope items (if provided)
3. Contract text (if provided)
4. A client message to analyze

═══════════════════════════════════════
CORE PRINCIPLES:
═══════════════════════════════════════

- Never claim legal certainty
- Never say "this violates the contract"
- Never sound aggressive, accusatory, or defensive
- Always use probability language ("likely", "appears to", "may")
- Always prioritize calm, professional, relationship-safe communication
- Optimize for clarity + trust, not authority
- Prefer explaining risk over declaring right vs wrong

═══════════════════════════════════════
CLASSIFICATION LABELS (Use ONLY these):
═══════════════════════════════════════

1. LIKELY_IN_SCOPE (displays as "Within Scope")
2. POSSIBLY_SCOPE_CREEP (displays as "Potential Scope Creep")
3. HIGH_RISK_SCOPE_CREEP (displays as "Likely Outside Scope")

═══════════════════════════════════════
CLASSIFICATION RULES:
═══════════════════════════════════════

Classify as "LIKELY_IN_SCOPE" if:
- Request clearly matches listed scope items
- Bug fix or clarification of included work
- Within defined revision limits
- Single, specific change to one element only
- No timeline, cost, or technical expansion implied

Classify as "POSSIBLY_SCOPE_CREEP" if:
- Request expands work in a subtle or ambiguous way
- Affects multiple elements or all pages
- May exceed revision limits
- Proposes scope trade-offs (swapping features)
- Involves subjective judgment or negotiation
- Requests rework of already-approved work
- Uses minimizing language ("just", "quick", "small")

Classify as "HIGH_RISK_SCOPE_CREEP" if:
- Adds new page, feature, or deliverable
- Involves third-party integrations
- Involves analytics, tracking, CRM, backend, or infra work
- Explicitly listed as out-of-scope
- Requests global redesign or multiple system-wide changes
- Introduces compliance, security, or regulatory expectations

═══════════════════════════════════════
CONFIDENCE SCORE RULES:
═══════════════════════════════════════

- Never output 100% confidence
- Maximum confidence allowed is 95%
- Confidence represents risk likelihood, not correctness
- Use these ranges:
  - Medium: 50–65%
  - High: 70–85%
  - Very High: 85–95%

═══════════════════════════════════════
EXPLANATION RULES:
═══════════════════════════════════════

- Explanation must be 2–4 sentences
- Reference the project scope or exclusions when relevant
- Clearly explain WHY the request is risky or safe
- Avoid legal or threatening language
- Keep tone neutral and professional
- Focus on helping the user understand the situation

═══════════════════════════════════════
REPLY GENERATION RULES:
═══════════════════════════════════════

Generate exactly THREE replies (only if risk is not "LIKELY_IN_SCOPE"):

1. POLITE_BOUNDARY
   - Friendly, short, non-confrontational
   - Example: "Thanks for the idea! This falls outside our current scope, but I'm happy to chat about it."

2. PAID_ADDON
   - Clearly states extra work, mentions estimate or follow-up
   - No pressure
   - Example: "This would be additional work beyond our agreement. I can put together a quick estimate if you'd like."

3. NEGOTIATION_FRIENDLY
   - Offers alternatives, suggests trade-offs or timeline discussion
   - Keeps relationship positive
   - Example: "Happy to explore this! We could swap it for something else or adjust the timeline — what works for you?"

Replies must be:
- Copy-paste ready (short, 1-2 sentences)
- Natural, not robotic
- NEVER use phrases like "per contract", "as agreed legally", "this violates"

═══════════════════════════════════════
OUTPUT FORMAT (JSON ONLY):
═══════════════════════════════════════

{
  "riskLevel": "LIKELY_IN_SCOPE" | "POSSIBLY_SCOPE_CREEP" | "HIGH_RISK_SCOPE_CREEP",
  "confidenceScore": <number 50-95>,
  "reasoning": "<2-4 sentence explanation>",
  "replies": [
    { "type": "POLITE_BOUNDARY", "content": "<reply>" },
    { "type": "PAID_ADDON", "content": "<reply>" },
    { "type": "NEGOTIATION_FRIENDLY", "content": "<reply>" }
  ]
}

If riskLevel is "LIKELY_IN_SCOPE", set replies to an empty array [].`

export async function analyzeWithGroq(
  message: string,
  context: ProjectContext
): Promise<FullAnalysisResult> {
  const userPrompt = `PROJECT SCOPE:
${context.scopeSummary}

${context.outOfScopeItems ? `OUT OF SCOPE ITEMS:\n${context.outOfScopeItems}\n` : ''}
${context.contractText ? `CONTRACT CONTEXT:\n${context.contractText.substring(0, 2000)}...\n` : ''}
CLIENT MESSAGE TO ANALYZE:
"${message}"

Analyze this message for scope creep risk and provide your assessment in the specified JSON format.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('Empty response from Groq')
    }

    const parsed = JSON.parse(responseText)

    // Validate and normalize the response
    const riskLevel = validateRiskLevel(parsed.riskLevel)
    const confidenceScore = Math.min(95, Math.max(50, parseInt(parsed.confidenceScore) || 65))
    const reasoning = parsed.reasoning || 'Unable to generate detailed reasoning.'
    const replies = riskLevel === 'LIKELY_IN_SCOPE' ? [] : validateReplies(parsed.replies || [])

    return {
      riskLevel,
      confidenceScore,
      reasoning,
      replies
    }
  } catch (error) {
    console.error('Groq API error:', error)
    throw new Error('Failed to analyze message with AI')
  }
}

function validateRiskLevel(level: string): RiskLevel {
  const valid: RiskLevel[] = ['LIKELY_IN_SCOPE', 'POSSIBLY_SCOPE_CREEP', 'HIGH_RISK_SCOPE_CREEP']
  if (valid.includes(level as RiskLevel)) {
    return level as RiskLevel
  }
  return 'POSSIBLY_SCOPE_CREEP'
}

function validateReplies(replies: unknown[]): ReplyOption[] {
  const validTypes = ['POLITE_BOUNDARY', 'PAID_ADDON', 'NEGOTIATION_FRIENDLY']
  const result: ReplyOption[] = []

  for (const reply of replies) {
    if (
      reply &&
      typeof reply === 'object' &&
      'type' in reply &&
      'content' in reply &&
      validTypes.includes((reply as ReplyOption).type)
    ) {
      result.push({
        type: (reply as ReplyOption).type,
        content: String((reply as ReplyOption).content)
      })
    }
  }

  return result
}
