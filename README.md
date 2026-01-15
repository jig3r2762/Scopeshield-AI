# ScopeShield AI

A SaaS application that helps freelancers and agencies detect scope creep in client messages and generate professional reply suggestions.

## Features

- **Message Analysis**: Paste client messages to detect scope creep risk
- **Risk Assessment**: Get risk levels (In Scope, Possibly Scope Creep, High Risk) with confidence scores
- **Reply Suggestions**: Generate 3 professional reply options when scope creep is detected
- **Project Management**: Create projects with scope definitions
- **PDF Contract Upload**: Upload contracts for better context
- **Message History**: Track all analyzed messages per project

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **AI**: Mock responses (ready for Anthropic API integration)

## Getting Started

### Prerequisites

- Node.js 20.x or later
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository and navigate to the project:
   ```bash
   cd scopeshield-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: A secure random string (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)

4. Set up the database:
   ```bash
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Create an account** or sign in
2. **Create a project** with:
   - Project name
   - Scope summary (bullet points of what's included)
   - Out-of-scope items (optional)
   - Contract PDF (optional)
3. **Analyze messages**: Paste client messages to get risk assessments
4. **Copy reply suggestions**: Use the generated replies as templates

## AI Integration

Currently using pattern-based mock responses for testing. To integrate with Anthropic Claude:

1. Add your API key to `.env`:
   ```
   ANTHROPIC_API_KEY=your-key-here
   ```

2. Update `src/lib/ai/analyzer.ts` to use the Anthropic API instead of pattern matching.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Login page
│   └── register/         # Register page
├── components/            # React components
│   ├── dashboard/        # Dashboard components
│   ├── providers/        # Context providers
│   └── ui/               # UI components
├── lib/                   # Utilities
│   ├── ai/               # AI analysis logic
│   ├── auth.ts           # NextAuth configuration
│   ├── pdf.ts            # PDF extraction
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
└── types/                 # TypeScript types
```

## Important Notes

- This tool provides **risk assessment only**, not legal advice
- Always use probability language ("likely", "appears to be")
- Users must manually send all replies
- Prioritize preserving client relationships

## License

MIT
