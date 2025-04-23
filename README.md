# 🧠 NeuroFolio

**NeuroFolio** is an AI-enhanced personal portfolio that revolutionizes the way professionals showcase their projects. It dynamically generates engaging project summaries using LLMs, adapts content based on audience preferences, and allows recruiters to interact with your portfolio in a personal and conversational way.

## 🚀 Features

- **🧠 AI-Generated Project Summaries:**
  Each project is enriched with automatically generated descriptions powered by advanced language models.

- **🔄 Real-Time Content Updates:**
  Your portfolio stays up-to-date with your GitHub commits, blog posts, or any other source.

- **💬 Conversational Portfolio Chatbot:**
  A friendly AI assistant embedded in your portfolio to answer recruiter or visitor questions.

- **🌍 Multilingual Experience:**
  Automatically translates your portfolio into multiple languages using Groq for global accessibility.

- **📊 Dynamic Insights & Analytics:**
  Track visitor engagement, most viewed projects, and chatbot interactions.

- **🔗 Easy Deployment:**
  Deployable on Vercel, with backend powered by Supabase or Railway. Integrates easily with your GitHub.

## 🛠️ Tech Stack

**Frontend**
- Next.js
- Tailwind CSS
- Shadcn/UI & Lucide Icons
- Recharts

**Backend**
- Supabase (Database & Auth)
- Railway (Optional backend server)
- OpenAI / Groq (LLM APIs)

**AI & Automation**
- LangChain / OnchainKit
- GPT-4 / Mixtral / LLaMA models
- Webhooks for GitHub + RSS feeds

## 🧹 Modules

- `DynamicSummary`: Auto-generates project summaries
- `LangTranslate`: Enables multilingual content
- `ChatWithMe`: Custom chatbot interface
- `UpdateListener`: Watches for changes and updates content
- `InsightPanel`: Recharts dashboard with visitor insights

## ⚙️ Setup

```bash
git clone https://github.com/Rishav594612/neurofolio.git
cd neurofolio
pnpm install
pnpm dev
```

### Environment Variables
Create a `.env.local` file and add:
OPENAI_API_KEY=your_key_here
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
GROQ_API_KEY=your_key
```

---

## 🤝 Contributing
Pull requests are welcome. For major changes, open an issue first to discuss what you’d like to change.

## 📄 License
[MIT](LICENSE)

