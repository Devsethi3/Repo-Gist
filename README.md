<div align="center">
  <img src="/public/icon.svg" alt="RepoGist Logo" width="120" height="120" />
  
  # RepoGist

**AI-Powered GitHub Repository Analyzer**

Instantly analyze any GitHub repository with AI. Get comprehensive insights on code quality, architecture, dependencies, security vulnerabilities, and actionable improvement suggestions.

  <br />

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel&logoColor=white)](https://repo-gist.vercel.app)
[![Star](https://img.shields.io/github/stars/Devsethi3/Repo-Gist?style=for-the-badge&logo=github&label=Star&color=yellow)](https://github.com/Devsethi3/Repo-Gist)

  <div class="">
  <img src="/public/og-image.png" alt="RepoGist Screenshot" width="800" style="border-radius: 10px; border: 2px solid #2e2e2e;" />
    
  </div>
  <br />
  <br />


  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js_16.1.0-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16.1.0" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </a>

  <br />

  <br />
</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 About

**RepoGist** is an intelligent tool that analyzes GitHub repositories and provides AI-powered insights. It helps developers and teams understand codebases quickly without manually reading through thousands of lines of code.

Whether you're evaluating a new open-source project, onboarding to a new codebase, or auditing your own repository, RepoGist provides instant, actionable insights.

### Why RepoGist?

- ⏱️ **Save Time**: Get repository insights in seconds, not hours
- 🧠 **AI-Powered**: Leverages advanced AI models for intelligent analysis
- 📊 **Comprehensive**: Analyzes structure, dependencies, code quality, and more
- 🎨 **Beautiful UI**: Modern, responsive interface with dark mode support
- 🚀 **Fast**: Built with Next.js 16.1.0 for optimal performance
- 🔒 **Secure**: No code is stored; analysis happens in real-time

---

## ✨ Features

### Core Features

| Feature                        | Description                                                    |
| ------------------------------ | -------------------------------------------------------------- |
| 🔍 **Repository Analysis**     | Deep analysis of repository structure, files, and organization |
| 🤖 **AI Summaries**            | Intelligent summaries and recommendations powered by AI        |
| 📁 **File Tree Visualization** | Interactive file tree with syntax highlighting                 |
| 📊 **Code Metrics**            | Lines of code, file counts, language distribution              |
| 🔗 **Dependency Analysis**     | Analyze package.json, requirements.txt, and more               |
| 🛡️ **Security Insights**       | Identify potential security vulnerabilities                    |
| ⚡ **Automation Suggestions**  | Get GitHub Actions and workflow recommendations                |
| 📱 **Responsive Design**       | Works seamlessly on desktop, tablet, and mobile                |
| 🌙 **Dark Mode**               | Beautiful dark and light theme support                         |
| 📤 **Share Results**           | Generate shareable cards for social media                      |

### Additional Features

- 🔄 Real-time analysis progress tracking
- 📋 Copy-to-clipboard functionality
- 🏷️ Technology stack detection
- 📈 Repository health scoring
- 🎨 Customizable share cards
- ⌨️ Keyboard shortcuts support
- 🖱️ Custom Figma-style cursor

---

## 🛠️ Tech Stack

### Frontend

| Technology                                      | Version    | Purpose                         |
| ----------------------------------------------- | ---------- | ------------------------------- |
| [Next.js](https://nextjs.org/)                  | **16.1.0** | React framework with App Router |
| [React](https://react.dev/)                     | 19.x       | UI library                      |
| [TypeScript](https://www.typescriptlang.org/)   | 5.x        | Type safety                     |
| [Tailwind CSS](https://tailwindcss.com/)        | 4.x        | Utility-first CSS               |
| [Framer Motion](https://www.framer.com/motion/) | 11.x       | Animations                      |
| [Radix UI](https://www.radix-ui.com/)           | Latest     | Accessible components           |
| [Hugeicons](https://hugeicons.com/)             | Latest     | Icon library                    |

### Backend & APIs

| Technology                                                            | Purpose         |
| --------------------------------------------------------------------- | --------------- |
| [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) | Backend API     |
| [GitHub REST API](https://docs.github.com/en/rest)                    | Repository data |
| [OpenRouter AI](https://openrouter.ai/)                               | AI analysis     |
| [Google Gemini](https://ai.google.dev/)                               | AI model        |

### Development & Tools

| Tool                             | Purpose         |
| -------------------------------- | --------------- |
| [pnpm](https://pnpm.io/)         | Package manager |
| [ESLint](https://eslint.org/)    | Code linting    |
| [Prettier](https://prettier.io/) | Code formatting |
| [Vercel](https://vercel.com/)    | Deployment      |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0

```bash
# Check Node.js version
node --version

# Install pnpm (if not installed)
npm install -g pnpm

# Check pnpm version
pnpm --version
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Devsethi3/Repo-Gist.git
cd Repo-Gist
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

4. **Run the development server**

```bash
pnpm dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# GitHub API Token (required)
# Get yours at: https://github.com/settings/tokens
GITHUB_TOKEN=your_github_personal_access_token

# OpenRouter API Key (required for AI features)
# Get yours at: https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key

# Site URL (for SEO and social sharing)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 📖 Usage

### Basic Usage

1. **Enter a GitHub URL**: Paste any public GitHub repository URL
2. **Analyze**: Click the analyze button or press Enter
3. **View Results**: Explore the comprehensive analysis

### Example URLs

```
https://github.com/facebook/react
https://github.com/vercel/next.js
https://github.com/tailwindlabs/tailwindcss
```

---

## 📁 Project Structure

```
Repo-Gist/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   └── analyze/          # Analysis endpoint
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── globals.css           # Global styles
│   └── sitemap.ts            # Dynamic sitemap
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── analysis/             # Analysis-related components
│   ├── share-dialog/         # Share functionality
│   └── ...                   # Other components
├── lib/                      # Utility functions
│   ├── utils.ts              # Helper functions
│   ├── types.ts              # TypeScript types
│   └── constants.ts          # Constants
├── context/                  # React context providers
│   ├── analysis-context.tsx  # Analysis state
│   └── theme-provider.tsx    # Theme state
├── hooks/                    # Custom React hooks
├── public/                   # Static assets
│   ├── og-image.png          # Open Graph image
│   ├── favicon.ico           # Favicon
│   └── ...                   # Other assets
├── .env.example              # Environment variables example
├── .env.local                # Local environment variables
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
└── pnpm-lock.yaml            # pnpm lock file
```

---

## 🔌 API Reference

### Analyze Repository

```http
POST /api/analyze
```

#### Request Body

```json
{
  "repoUrl": "https://github.com/owner/repo"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "repository": {
      "name": "repo",
      "fullName": "owner/repo",
      "description": "Repository description",
      "stars": 1000,
      "forks": 100,
      "language": "TypeScript"
    },
    "analysis": {
      "summary": "AI-generated summary...",
      "techStack": ["Next.js", "TypeScript", "Tailwind CSS"],
      "fileStructure": [...],
      "dependencies": [...],
      "suggestions": [...],
      "securityIssues": [...],
      "automations": [...]
    }
  }
}
```

---

## 🧪 Scripts

```bash
# Development
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm start         # Start production server
pnpm lint          # Run ESLint
pnpm lint:fix      # Fix ESLint errors
pnpm type-check    # Run TypeScript check

# Testing (if configured)
pnpm test          # Run tests
pnpm test:watch    # Run tests in watch mode
pnpm test:coverage # Run tests with coverage
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs**: Open an issue describing the bug
- ✨ **Suggest Features**: Open an issue with your idea
- 📖 **Improve Docs**: Fix typos, add examples
- 🔧 **Submit PRs**: Fix bugs or add features

### Development Workflow

1. **Fork the repository**

```bash
# Fork via GitHub UI, then:
git clone https://github.com/YOUR_USERNAME/Repo-Gist.git
cd Repo-Gist
```

2. **Create a branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**

```bash
# Make changes
pnpm lint        # Check for errors
pnpm type-check  # Verify types
pnpm build       # Test build
```

4. **Commit your changes**

```bash
git commit -m "feat: add amazing feature"
```

5. **Push and create PR**

```bash
git push origin feature/amazing-feature
# Open a Pull Request via GitHub
```

## 👤 Author

<div align="center">
  <img src="https://github.com/Devsethi3.png" width="100" height="100" style="border-radius: 50%; border: 4px solid #8A2BE2;" alt="Dev Prasad Sethi" />
  
  ### Dev Prasad Sethi
  
  Full Stack Developer | Building in Public
  
  <a href="https://x.com/imsethidev">
    <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter" />
  </a>
  <a href="https://github.com/Devsethi3">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  
</div>

---

<div align="center">
  
  **If you found this project helpful, please consider giving it a ⭐**
  
  <a href="https://github.com/Devsethi3/Repo-Gist">
    <img src="https://img.shields.io/github/stars/Devsethi3/Repo-Gist?style=for-the-badge&logo=github&label=Star&color=yellow" />
  </a>
  
  <br />
  <br />

Made with ❤️ by [Dev Prasad Sethi](https://x.com/imsethidev)

</div>
