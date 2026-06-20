# GaBooRa AI Chatbot

GaBooRa AI is a responsive, high-fidelity AI chat interface built on Next.js, Tailwind CSS (v4), and the Google Gemini API. It is designed to look premium, professional, and work across all device form factors.

---

## Key Features

- **📱 Fully Responsive Design**: Built with mobile-first principles. Features a persistent side navigation panel on desktop viewports and a smooth-sliding drawer sidebar on mobile screens.
- **💾 Session Persistence**: Supports creating, switching, renaming, and deleting multiple chat sessions. Conversions are cached and loaded via the browser's `localStorage` to ensure they persist across page refreshes.
- **✨ Smart Auto-Naming**: Automatically renames new conversations from "New Chat" to a summary of the first sent prompt.
- **🌓 Theme Toggle**: Implemented visual mode controls (dark/light mode) with preference persistence and system theme defaults.
- **📝 Custom Markdown Engine**: Render formatted assistant responses cleanly without heavy dependencies:
  - Formats headers, paragraphs, and list formats.
  - Renders tabular markdown tables.
  - Packages code blocks in editors showing language titles and a **Copy Code** button.
- **💡 Suggested Prompts**: Provides interactive quick-starter templates when opening a new chat window.
- **⌨️ Multi-line Autosizing Input**: Custom input textarea that grows dynamically as you write longer prompts.

---

## Directory Structure

```text
├── app/
│   ├── api/chat/route.ts      # Gemini API model invocation endpoint
│   ├── globals.css            # Stylesheets, custom scrollbars, animations
│   ├── layout.tsx             # Fonts and fontawesome wrappers
│   └── page.tsx               # Main chat application page and layout controller
├── components/
│   ├── Sidebar.tsx            # Session list drawer, actions, and settings
│   ├── MessageBubble.tsx      # User/assistant bubbles, timestamps, status indicator
│   ├── Markdown.tsx           # Custom parser for formatting and copy blocks
│   ├── SuggestedPrompts.tsx   # Interactive preset card grids
│   └── ThemeToggle.tsx        # Light/dark mode button
├── lib/
│   ├── gemini.ts              # Google GenAI model setup
│   ├── utils.ts               # Tailwind merge class resolver
│   └── fontawesome.ts         # FontAwesome config rules
```

---

## Getting Started

### 1. Configure API Credentials
Create a `.env` file in the root directory and add your Google Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
To bundle and optimize the application:
```bash
npm run build
npm start
```
