<div align="center">
  <img src="/public/icon.svg" alt="RepoGist Logo" width="100" height="100" />
  
  # RepoGist
  
  ### Understand Any Codebase in Seconds
  
  AI-powered GitHub repository analyzer that gives you instant insights on code quality, architecture, security, and actionable improvements.

  <br />

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-black?style=for-the-badge)](https://repo-gist.vercel.app)
[![GitHub Stars](https://img.shields.io/github/stars/Devsethi3/Repo-Gist?style=for-the-badge&logo=github&label=Stars&color=yellow)](https://github.com/Devsethi3/Repo-Gist)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

  <br />
  
  <p>
    <!-- <a href="#-demo">View Demo</a> • -->
    <a href="#-features">Features</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-contributing">Contributing</a>
  </p>

  <br />

  <img src="/public/og-image.png" alt="RepoGist Screenshot" width="800" style="border-radius: 12px;" />

</div>

<br />

---

## ✨ Features

### More Features

- 📁 **Interactive File Tree** - Explore repository structure with syntax highlighting
- 📊 **Health Scoring** - Get a comprehensive score for code quality
- 🔗 **Dependency Analysis** - Understand package dependencies
- 🏷️ **Tech Stack Detection** - Automatically identify technologies used
- 🌙 **Dark/Light Mode** - Beautiful themes for any preference
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Lightning Fast** - Built with Next.js 16 for optimal performance
- 🔄 **Real-time Progress** - Watch the analysis happen live

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Devsethi3/Repo-Gist.git
cd Repo-Gist

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
# Required
GITHUB_TOKEN=your_github_token          # https://github.com/settings/tokens
OPENROUTER_API_KEY=your_openrouter_key  # https://openrouter.ai/keys

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

<details>
<summary><b>📋 How to get API keys</b></summary>

#### GitHub Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `read:user`
4. Copy the token

#### OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up or log in
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Create a new key

</details>

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td><b>Framework</b></td>
    <td>
      <img src="https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js" />
      <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black" />
    </td>
  </tr>
  <tr>
    <td><b>Language</b></td>
    <td>
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    </td>
  </tr>
  <tr>
    <td><b>Styling</b></td>
    <td>
      <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
      <img src="https://img.shields.io/badge/shadcn/ui-000000?style=flat-square&logo=shadcnui&logoColor=white" />
    </td>
  </tr>
  <tr>
    <td><b>Animation</b></td>
    <td>
      <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white" />
    </td>
  </tr>
  <tr>
    <td><b>AI</b></td>
    <td>
      <img src="https://img.shields.io/badge/OpenRouter-000000?style=flat-square" />
    </td>
  </tr>
  <tr>
    <td><b>Deployment</b></td>
    <td>
      <img src="https://img.shields.io/badge/Vercel-black?style=flat-square&logo=vercel" />
    </td>
  </tr>
</table>

---

## 📁 Project Structure

```
repo-gist/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── analyze/        # Repository analysis
│   │   └── og/             # OG image generation
│   ├── share/              # Share pages
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── repo-analyzer/      # Main analyzer component
│   ├── share-card/         # Share card components
│   └── ...
├── lib/
│   ├── ai.ts               # AI integration
│   ├── github.ts           # GitHub API
│   ├── share.ts            # Share utilities
│   └── types.ts            # TypeScript types
├── hooks/                  # Custom React hooks
└── public/                 # Static assets
```

---

## 📖 Usage

### Analyze a Repository

1. **Paste a GitHub URL** into the input field
2. **Click Analyze** or press `Enter`
3. **Explore** the comprehensive analysis

### Example Repositories

```
https://github.com/facebook/react
https://github.com/vercel/next.js
https://github.com/tailwindlabs/tailwindcss
```

### Share Your Analysis

After analyzing, click the **Share** button to:

- 📋 Copy a shareable link
- 🐦 Share on Twitter/X
- 💼 Share on LinkedIn
- 📥 Download as image

---

## 🔌 API Reference

### POST `/api/analyze`

Analyze a GitHub repository.

**Request:**

```json
{
  "repoUrl": "https://github.com/owner/repo"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "metadata": { "name": "repo", "stars": 1000 },
    "scores": { "overall": 85, "codeQuality": 90 },
    "insights": [...],
    "techStack": ["Next.js", "TypeScript"]
  }
}
```

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/Repo-Gist.git

# Create a branch
git checkout -b feature/amazing-feature

# Make changes and commit
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `chore:` Maintenance

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [OpenRouter](https://openrouter.ai/) - AI integration
- [Vercel](https://vercel.com/) - Hosting

---

<div align="center">

## 👤 Author

<img src="https://github.com/Devsethi3.png" width="80" height="80" style="border-radius: 50%;" alt="Dev Prasad Sethi" />

**Dev Prasad Sethi**

[![Twitter](https://img.shields.io/badge/@imsethidev-1DA1F2?style=flat-square&logo=twitter&logoColor=white)](https://x.com/imsethidev)
[![GitHub](https://img.shields.io/badge/Devsethi3-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Devsethi3)

---

**If you find this project useful, please consider giving it a ⭐**

<a href="https://github.com/Devsethi3/Repo-Gist">
  <img src="https://img.shields.io/github/stars/Devsethi3/Repo-Gist?style=for-the-badge&logo=github&label=Star%20this%20repo&color=yellow" />
</a>

<br /><br />

Made with ❤️ and ☕

</div>
