# FitTrack Pro

A comprehensive fitness tracking application built with modern web technologies to help users achieve their health and fitness goals.

## Features

- **Workout Tracking**: Log and monitor your exercise routines
- **Nutrition Management**: Track meals and calorie intake
- **Water Intake**: Monitor daily hydration levels
- **Progress Analytics**: Visualize your fitness journey with charts
- **AI-Powered Recommendations**: Get personalized workout and meal suggestions

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Supabase (Authentication, Database)
- **AI Features**: OpenAI API integration

## Getting Started

### Prerequisites

- Node.js (v18+)
- Supabase account
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fitness-app.git
cd fitness-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Configuration

Add the following to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_APP_OPENAI_API_KEY=your-openai-api-key
```

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Documentation

For detailed documentation on components and API usage, see the [docs folder](/docs).

## License

MIT