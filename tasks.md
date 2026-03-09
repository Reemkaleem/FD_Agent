# Development Tasks: Figma to React AI Converter

## 🚀 Rapid MVP Build Plan (1-2 Days)

**Goal**: Production-ready tool for solo developer  
**Stack**: React + Node.js + Ollama (phi3-mini) + Figma API  
**Deployment**: Local/on-premises only  
**No**: Database, auth, cloud services

---

## Day 1: Core Functionality (8-10 hours)

### Morning Session (4 hours)

### Morning Session (4 hours)

#### Task 1.1: Setup & Dependencies (1 hour)
- [ ] Install Ollama: `curl -fsSL https://ollama.com/install.sh | sh`
- [ ] Pull phi3-mini model: `ollama pull phi3:mini` (~2.3GB)
- [ ] Start Ollama server: `ollama serve` (keep running)
- [ ] Create project structure:
  ```
  figma-to-react/
  ├── backend/     # Node.js API
  └── frontend/    # React app
  ```
- [ ] Initialize backend: `npm init -y` + install express, cors, node-fetch
- [ ] Initialize frontend: `npm create vite@latest frontend -- --template react-ts`
- [ ] Get Figma Personal Access Token from https://figma.com/settings

**Deliverable**: Project skeleton + Ollama ready

---

#### Task 1.2: Backend Core (3 hours)

**Create backend/src/index.js:**
- [ ] Basic Express server on port 3000
- [ ] Enable CORS for localhost:5173
- [ ] Health check endpoint: `GET /health`
- [ ] Test: `curl http://localhost:3000/health`

**Create backend/src/services/figmaService.js:**
- [ ] Function to parse Figma URL → extract file key
- [ ] Function to call Figma API with token
- [ ] Function to simplify Figma JSON (remove unnecessary fields)
- [ ] Test with a real Figma URL

**Create backend/src/services/ollamaService.js:**
- [ ] Function to call Ollama API (localhost:11434)
- [ ] Function to build LLM prompt from Figma JSON
- [ ] Test prompt with sample data
- [ ] Parse LLM response to extract code

**Create backend/src/routes/convert.js:**
- [ ] POST /api/convert endpoint
- [ ] Request body: { figmaUrl, figmaToken, outputFormat }
- [ ] Response: { success, code, componentName, error }
- [ ] Connect all services together

**Deliverable**: Working backend API

---

### Afternoon Session (4-6 hours)

#### Task 1.3: Frontend UI (3 hours)

**Create frontend/src/App.tsx:**
- [ ] State management (useState hooks):
  - figmaUrl, figmaToken, generatedCode, isLoading, error
- [ ] Save/load figmaToken from localStorage

**Create frontend/src/components:**
- [ ] Input field for Figma URL (with validation)
- [ ] Input field for Figma token (password field, saved to localStorage)
- [ ] "Generate Code" button (disabled while loading)
- [ ] Loading spinner with progress message
- [ ] Code display area (textarea or simple div)
- [ ] Copy to clipboard button
- [ ] Download as .tsx file button
- [ ] Error message display

**Styling with Tailwind:**
- [ ] Install Tailwind CSS
- [ ] Basic styling: centered layout, clean forms, monospace code display
- [ ] Responsive design (works on laptop screen minimum)

**API Integration:**
- [ ] Create API client function
- [ ] Handle POST /api/convert
- [ ] Display generated code
- [ ] Handle errors gracefully

**Deliverable**: Functional UI

---

#### Task 1.4: Integration & Testing (2 hours)

- [ ] End-to-end test: Figma URL → Generated code
- [ ] Test with multiple Figma designs:
  - Simple button
  - Card component
  - Form layout
- [ ] Fix bugs and edge cases
- [ ] Improve error messages
- [ ] Add helpful tooltips/instructions

**Deliverable**: Working MVP (basic)

**Deliverable**: Working MVP (basic)

---

## Day 2: Polish & Production Ready (4-6 hours)

### Morning Session (3 hours)

#### Task 2.1: Improve Code Generation Quality (2 hours)

**Prompt Engineering:**
- [ ] Refine system prompt for better code quality
- [ ] Add examples (few-shot learning)
- [ ] Test with various Figma component types:
  - Buttons (different variants)
  - Text fields
  - Cards
  - Navigation bars
  - Simple layouts

**JSON Simplification:**
- [ ] Optimize Figma JSON parsing
- [ ] Extract only essential properties
- [ ] Reduce token count for faster generation

**Code Post-Processing:**
- [ ] Remove markdown code blocks from LLM output
- [ ] Validate generated code syntax
- [ ] Add proper imports automatically
- [ ] Format with simple regex or Prettier (optional)

**Deliverable**: Higher quality code output (80%+ accuracy)

---

#### Task 2.2: Error Handling & UX (1 hour)

- [ ] Better error messages:
  - "Ollama not running" → show setup instructions
  - "Invalid Figma URL" → show URL format example
  - "Figma API error" → explain token issues
  - "Code generation failed" → show simplified JSON for manual debugging

- [ ] Loading states:
  - "Fetching design from Figma..." (3s)
  - "Analyzing components..." (2s)
  - "Generating React code..." (20s)
  - Progress indicator if possible

- [ ] Success state:
  - Show success message
  - Highlight copy button
  - Show file name suggestion

- [ ] Add Instructions/Help:
  - How to get Figma token
  - Supported Figma design types
  - Tips for best results

**Deliverable**: Polished user experience

---

### Afternoon Session (2-3 hours)

#### Task 2.3: Configuration Options (1 hour)

Add basic toggles/options:
- [ ] TypeScript vs JavaScript (TSX vs JSX)
- [ ] Component naming: PascalCase (default) vs camelCase
- [ ] Include TypeScript types: Yes (default) vs No
- [ ] Save preferences to localStorage

Optional (if time):
- [ ] Multiple styling options: Tailwind (default), inline styles, CSS classes
- [ ] Export as single file vs separate component + types

**Deliverable**: Basic configuration system

---

#### Task 2.4: Documentation & Deployment Prep (1-2 hours)

**Create README.md:**
- [ ] Project description
- [ ] Prerequisites (Node.js, Ollama)
- [ ] Installation steps
- [ ] Usage instructions
- [ ] Troubleshooting guide
- [ ] Limitations and known issues

**Create SETUP.md:**
- [ ] Detailed Ollama installation (Linux, macOS, Windows/WSL)
- [ ] Model download instructions
- [ ] Figma token generation guide
- [ ] First run guide

**Production Build:**
- [ ] Build frontend: `npm run build`
- [ ] Configure backend to serve frontend static files
- [ ] Test production build locally
- [ ] Create start script: `npm start`

**Deployment Guide:**
- [ ] Write instructions for company server deployment
- [ ] System requirements
- [ ] Port configuration
- [ ] Systemd service file (optional)
- [ ] Nginx reverse proxy config (optional)

**Deliverable**: Deployment-ready application with docs

---

## Optional Enhancements (If Time Remaining)

### Priority 1 (30 min each)
- [ ] **Monaco Editor**: Replace textarea with VS Code editor component
- [ ] **Syntax Highlighting**: Add code highlighting to display
- [ ] **Multiple Frames**: Support converting multiple Figma frames at once
- [ ] **History**: Save last 10 conversions in localStorage

### Priority 2 (1 hour each)
- [ ] **Model Selection**: Allow switching between phi3, llama3, codellama
- [ ] **Design Preview**: Show Figma design thumbnail alongside code
- [ ] **Component Props**: Better inference of React props from Figma variants
- [ ] **Dark Mode**: Toggle dark/light theme

### Priority 3 (2+ hours each)
- [ ] **Storybook Integration**: Generate Storybook stories automatically
- [ ] **Component Library Detection**: Recognize Material-UI, Chakra patterns
- [ ] **Asset Management**: Extract and optimize images/icons
- [ ] **Batch Processing**: Convert entire Figma pages at once

---

## Testing Checklist

### Before Declaring MVP "Done"

**Functional Tests:**
- [ ] Can paste Figma URL and get code back
- [ ] Code compiles without TypeScript errors
- [ ] Generated components render in browser
- [ ] Copy to clipboard works
- [ ] Download file works
- [ ] localStorage saves Figma token
- [ ] Error handling works for all common errors

**Design Types Tested:**
- [ ] Simple button
- [ ] Text input field
- [ ] Card with text and image
- [ ] Navigation bar
- [ ] Simple form (2-3 fields)
- [ ] Grid layout (2x2 cards)
- [ ] Single column layout

**Edge Cases:**
- [ ] Empty Figma file
- [ ] Very large design (50+ components)
- [ ] Invalid Figma URL
- [ ] Expired/invalid Figma token
- [ ] Ollama server not running
- [ ] Network timeout

**Code Quality:**
- [ ] Generated code follows React best practices
- [ ] Tailwind classes are valid
- [ ] Component names are PascalCase
- [ ] No obvious bugs in generated code
- [ ] TypeScript types are reasonable

---

## Deployment Checklist

### Before Deploying to Company Server

**Prerequisites:**
- [ ] Server meets minimum requirements (4 CPU, 8GB RAM)
- [ ] Node.js 20+ installed
- [ ] Ollama installed
- [ ] phi3:mini model downloaded
- [ ] Firewall allows access to figma.com (for API calls)
- [ ] Internal port available (default 3000)

**Deployment Steps:**
1. [ ] Clone repository to server
2. [ ] Install dependencies: `npm install` in both frontend and backend
3. [ ] Build frontend: `cd frontend && npm run build`
4. [ ] Configure backend to serve frontend static files
5. [ ] Start Ollama: `ollama serve` (background process)
6. [ ] Start backend: `npm start` (or use systemd service)
7. [ ] Test via browser: `http://server-ip:3000`
8. [ ] (Optional) Set up Nginx reverse proxy for custom domain
9. [ ] (Optional) Set up SSL certificate
10. [ ] Share URL with team

**Post-Deployment:**
- [ ] Monitor logs for errors
- [ ] Check Ollama memory usage
- [ ] Test with team members
- [ ] Gather feedback
- [ ] Document any issues

---

## Troubleshooting Guide

### Common Issues & Solutions

**"Ollama not running"**
- Solution: `ollama serve` in a terminal
- Check: `curl http://localhost:11434/api/tags`

**"Model not found"**
- Solution: `ollama pull phi3:mini`
- Check: `ollama list`

**"Figma API error 403"**
- Solution: Token expired or invalid
- Fix: Get new token from https://figma.com/settings

**"Code generation takes too long (>60s)"**
- Solution: CPU is slow
- Fix: Use GPU if available, or upgrade to faster model server

**"Generated code has errors"**
- Solution: Prompt needs improvement or Figma design too complex
- Fix: Simplify Figma design, improve prompt, try different model

**"Out of memory"**
- Solution: phi3-mini too large for system
- Fix: Close other applications, upgrade RAM, or use smaller model

---

## Success Metrics

### MVP Success Criteria

**Primary Metrics:**
- ✅ Can convert 80%+ of simple Figma components successfully
- ✅ Average conversion time < 30 seconds
- ✅ Generated code compiles without errors
- ✅ Tool can be deployed on company server
- ✅ Team members can use it without extensive training

**Secondary Metrics:**
- 🎯 Saves 60%+ development time vs manual coding
- 🎯 Team uses it for 3+ real projects
- 🎯 Positive feedback from 4+ team members
- 🎯 Less than 5 critical bugs in first week

---

## Timeline Summary

### Optimistic (1 Day - ~10 hours)
- **Scope**: Basic working prototype
- **Features**: URL input → Code output (no configuration, minimal UI)
- **Quality**: 70% accuracy, rough edges ok

### Realistic (2 Days - ~16 hours)
- **Scope**: Production-ready MVP
- **Features**: Full UI, configuration, error handling, documentation
- **Quality**: 80% accuracy, polished UI, ready for team use

### Conservative (3 Days - ~24 hours)
- **Scope**: MVP + enhancements
- **Features**: Everything above + Monaco editor, better prompts, testing
- **Quality**: 85% accuracy, thoroughly tested, great UX

---

## Next Steps After MVP

### Week 1 Post-Launch
- Gather user feedback
- Fix critical bugs
- Improve most common error cases
- Add most requested features

### Month 1
- Improve code quality (90% accuracy goal)
- Add component library support
- Better handling of complex layouts
- Performance optimizations

### Month 2-3
- VS Code extension
- Figma plugin  
- Batch processing
- Design system integration

---

## Notes

**Why this is achievable in 1-2 days:**
- ✅ No auth/database (biggest time savers)
- ✅ Use existing Figma API (no scraping needed)
- ✅ Ollama handles AI complexity
- ✅ Simple React SPA (no complex routing)
- ✅ Minimal dependencies
- ✅ Solo developer (no coordination overhead)

**Potential blockers:**
- ⚠️ Ollama setup issues
- ⚠️ Figma API rate limits
- ⚠️ LLM prompt engineering takes longer than expected
- ⚠️ Figma JSON more complex than anticipated

**Risk mitigation:**
- Start with Ollama setup first (fail fast if issues)
- Test Figma API with curl before coding
- Use simple prompt first, iterate later
- Test with simple Figma designs initially

---

**Ready to start? Begin with Task 1.1! 🚀**
