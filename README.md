# EVA Personal Assistant

AI-powered coaching assistant trained in your voice using Elite Coaching Academy methodology.

## Features

- 🧠 **AI Trainer**: Answer 30 questions to train your personal AI assistant
- 📊 **Dashboard**: Track progress and view analytics
- 💬 **AI Chat**: Interact with your trained assistant
- 📈 **Trend Analysis**: Analyze coaching patterns and insights
- 🎤 **Voice Input**: Record answers using microphone (with manual fallback)
- 📄 **Prefill**: Upload transcripts to auto-fill answers

## Tech Stack

- **Framework**: Next.js 14
- **Database**: PostgreSQL (via Prisma)
- **AI**: OpenAI GPT & Whisper
- **Styling**: CSS Modules
- **Deployment**: Vercel

## Local Development

1. **Clone and install dependencies**:
   ```bash
   git clone <your-repo>
   cd eca-personal-assistant
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Set up database**:
   ```bash
   # For local development, you can use SQLite:
   # Change prisma/schema.prisma to use sqlite provider
   npx prisma db push
   npx prisma generate
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

## Vercel Deployment

### 1. Database Setup

Choose one of these PostgreSQL providers:

**Option A: Neon (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

**Option B: PlanetScale**
1. Go to [planetscale.com](https://planetscale.com)
2. Create a new database
3. Copy the connection string

**Option C: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string from Settings > Database

### 2. Vercel Setup

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `RESEND_API_KEY`: Your Resend API key (optional)
     - `SENDER_EMAIL`: Your sender email
     - `APP_BASE_URL`: Your Vercel app URL
     - `GROK_API_KEY`: Your Grok API key (optional)

3. **Run database migrations**:
   ```bash
   # In Vercel dashboard, go to Functions tab and run:
   npx prisma db push
   npx prisma generate
   ```

### 3. Environment Variables

Required environment variables for Vercel:

```
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=sk-your-openai-api-key
RESEND_API_KEY=your-resend-api-key
SENDER_EMAIL=you@example.com
APP_BASE_URL=https://your-app.vercel.app
GROK_API_KEY=your-grok-api-key
```

## Database Schema

The app uses the following main models:
- `User`: User accounts and settings
- `TrainingAnswer`: AI training responses
- `Project`: Client projects and management
- `Transcript`: Call recordings and analysis
- `TrendAnalysis`: AI-generated insights

## API Endpoints

- `GET /api/trainer/questions` - Get training questions
- `POST /api/trainer/answer/[q]` - Save training answer
- `GET /api/trainer/status` - Get training progress
- `POST /api/trainer/prefill` - Prefill from transcript
- `POST /api/trainer/whisper` - Audio transcription
- `GET /api/dashboard` - Dashboard data
- `POST /api/trends` - Generate trend analysis

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check your `DATABASE_URL` format
2. **OpenAI API errors**: Verify your API key has sufficient credits
3. **Whisper transcription timeouts**: Use manual input as fallback
4. **Prefill not working**: Ensure your content matches fitness coaching topics

### Support

For issues or questions, check the server logs in Vercel dashboard or contact support.# EVA Personal Assistant - Updated Mon Sep 29 13:24:00 EDT 2025
# Database migration completed - Whop integration ready
