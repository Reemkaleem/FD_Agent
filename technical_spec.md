# Technical Specification: Figma to React AI Converter

## System Overview
A lightweight, locally-deployed web application that converts Figma designs to React code using free, open-source AI models (Ollama + phi3-mini). No external API dependencies, no database, no authentication required.

## Technology Stack

### Frontend (User Interface)
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Tailwind CSS (minimal styling)
- **State Management**: React useState/useContext (no external library)
- **API Client**: Native fetch API
- **Code Editor**: Simple textarea or Monaco Editor (optional)
- **Deployment**: Static files served by backend

### Backend (API Service)
- **Runtime**: Node.js 20+ or Python 3.11+ (FastAPI)
- **Framework**: Express.js (Node) or FastAPI (Python)
- **API Style**: Simple REST endpoints (3-4 routes)
- **Authentication**: None (single-user tool)
- **Validation**: Basic input validation

### AI/ML Components
- **LLM Runtime**: Ollama (local inference server)
- **Model**: phi3-mini (3.8B parameters, text-only)
- **Alternative**: llama3:8b or codellama:7b (if phi3 insufficient)
- **No Vision Model**: Use Figma API JSON directly (no image processing)
- **Prompt Engineering**: Custom prompts for React code generation

### Data Storage
- **Database**: None (stateless application)
- **Caching**: None for MVP (optional in-memory cache later)
- **File Storage**: None (code returned directly to client)
- **Session Storage**: Browser localStorage for Figma token

### Infrastructure
- **Hosting**: Local machine or company on-prem server
- **Deployment**: Single Docker container (optional) or native install
- **CI/CD**: Not required for MVP
- **Monitoring**: Console logs only
- **Port**: Single port (default 3000 or 8000)

## System Architecture Components

### 1. Figma Integration Layer
**Responsibility**: Fetch design data from Figma API

#### Components
- `FigmaAPIClient`: Simple wrapper for Figma REST API
  - Uses personal access token (provided by user)
  - Extracts file key from URL
  - Fetches file JSON: `GET /v1/files/:key`
- `URLParser`: Extract file key and node ID from Figma URL
- No OAuth, no authentication service needed

#### Key Operations
```typescript
interface FigmaIntegrationLayer {
  parseURL(url: string): { fileKey: string; nodeId?: string };
  fetchFile(fileKey: string, token: string): Promise<FigmaFile>;
  fetchNode(fileKey: string, nodeId: string, token: string): Promise<FigmaNode>;
}
```

### 2. Design Parser
**Responsibility**: Convert Figma JSON to normalized intermediate representation

#### Components
- `NodeTreeParser`: Parse Figma node hierarchy
- `StyleExtractor`: Extract colors, typography, spacing
- `LayoutAnalyzer`: Analyze Flexbox/Grid layouts
- `ComponentDetector`: Identify component patterns

#### Data Structures
```typescript
interface ParsedDesign {
  nodes: DesignNode[];
  styles: StyleSheet;
  assets: Asset[];
  hierarchy: ComponentTree;
}

interface DesignNode {
  id: string;
  type: 'FRAME' | 'GROUP' | 'TEXT' | 'RECTANGLE' | 'COMPONENT';
  name: string;
  bounds: BoundingBox;
  styles: ComputedStyle;
  children: DesignNode[];
  constraints: LayoutConstraints;
}
```

### 3. AI Code Generation Engine
**Responsibility**: Convert Figma JSON to React code using local LLM

#### Components
- `OllamaClient`: Communicate with local Ollama server
- `PromptBuilder`: Construct prompts from Figma JSON
- `ComponentClassifier`: Identify component types from node properties
- `CodeGenerator`: Generate React code using phi3-mini response

#### AI Prompts Strategy
```typescript
interface AIPrompt {
  system: string;        // System role definition
  user: string;          // Design JSON + instructions
  temperature: number;   // 0.3 for consistent code
  maxTokens: number;     // 2048 for component code
}
```

#### Example Prompt Template
```
System: You are an expert React developer. Convert Figma design JSON to production-ready React + Tailwind code.

User:
Figma Design (JSON):
{
  "name": "Button",
  "type": "FRAME",
  "backgroundColor": {"r": 0.2, "g": 0.5, "b": 1},
  "children": [{"type": "TEXT", "characters": "Click Me"}]
}

Generate:
1. React functional component (TSX)
2. Use Tailwind CSS classes
3. Preserve component name
4. Add proper types

Output only the code, no explanations.
```

### 4. Code Generation Pipeline
**Responsibility**: Transform analysis results into React code

#### Stages
1. **Component Structuring**: Organize into component hierarchy
2. **JSX Generation**: Create React JSX markup
3. **Style Generation**: Generate CSS/Tailwind/Styled Components
4. **Props Definition**: Infer and create prop types
5. **Code Formatting**: Run Prettier and ESLint
6. **Optimization**: Remove redundant code, optimize structure

#### Components
- `JSXBuilder`: Construct JSX tree
- `StyleGenerator`: Generate appropriate styling code
- `TypeScriptGenerator`: Add TypeScript types
- `ImportResolver`: Manage import statements
- `CodeFormatter`: Format with Prettier

#### Output Structure
```typescript
interface GeneratedCode {
  components: ComponentFile[];
  styles: StyleFile[];
  assets: AssetFile[];
  readme: string;
}

interface ComponentFile {
  filename: string;
  path: string;
  content: string;
  language: 'jsx' | 'tsx';
  dependencies: string[];
}
```

### 5. Configuration Manager
**Responsibility**: Handle user preferences and output customization

#### Configuration Schema
```typescript
interface ProjectConfig {
  outputFormat: 'jsx' | 'tsx';
  stylingApproach: 'css-modules' | 'styled-components' | 'tailwind' | 'emotion';
  componentLibrary?: 'mui' | 'chakra' | 'antd' | 'none';
  namingConvention: 'camelCase' | 'PascalCase' | 'kebab-case';
  fileStructure: 'single' | 'component-per-file' |  'atomic';
  features: {
    typescript: boolean;
    propTypes: boolean;
    storybook: boolean;
    tests: boolean;
  };
}
```

## Data Flow

### End-to-End Conversion Flow
```
1. User Input (Figma URL + Config)
   ↓
2. Figma Integration Layer
   - Authenticate
   - Fetch design data
   - Download assets
   ↓
3. Design Parser
   - Parse node tree
   - Extract styles
   - Analyze layout
   ↓
4. AI Analysis Engine
   - Capture design screenshot
   - Analyze with Vision API
   - Classify components
   - Extract semantic structure
   ↓
5. Code Generation Pipeline
   - Build component structure
   - Generate JSX
   - Generate styles
   - Add types
   - Format code
   ↓
6. Output Delivery
   - Package files
   - Return to user
```

## API Endpoints

### Simple REST API (3 endpoints)

#### 1. Health Check
```
GET /health
Response: { "status": "ok", "ollama": "connected" }
```

#### 2. Convert Design
```
POST /api/convert
Body: {
  "figmaUrl": "https://figma.com/file/ABC123/Design",
  "figmaToken": "figd_xxx",
  "outputFormat": "tsx" | "jsx",
  "useTypeScript": boolean
}
Response: {
  "success": true,
  "code": "// Generated React code...",
  "componentName": "MyComponent",
  "warnings": []
}
```

#### 3. Check Ollama Status
```
GET /api/ollama/status
Response: {
  "running": true,
  "model": "phi3-mini",
  "version": "3.8b"
}
```

## Data Storage

**No Database Required**

### Storage Strategy
- **Stateless Application**: Each request is independent
- **Client-Side Storage**: Figma token stored in browser localStorage
- **No User Data**: No accounts, no history, no persistence
- **Temporary Data**: Request/response only in memory during processing

### Future Considerations (Optional)
- Local file cache for recently processed designs (in-memory LRU cache)
- Conversion history in browser (IndexedDB)
- Still no server-side database needed

## AI Model Integration

### Ollama + phi3-mini Integration
```typescript
async function generateCodeWithOllama(
  figmaJSON: object,
  config: ConversionConfig
): Promise<string> {
  const prompt = buildPrompt(figmaJSON, config);
  
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      model: 'phi3:mini',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,  // Lower for consistent code
        num_predict: 2048  // Max tokens
      }
    })
  });
  
  const result = await response.json();
  return result.response;  // Generated React code
}
```

### Model Setup
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull phi3-mini model (~2.3GB)
ollama pull phi3:mini

# Start Ollama server
ollama serve

# Alternative models (if phi3 insufficient)
ollama pull llama3:8b        # Better quality, slower
ollama pull codellama:7b     # Specialized for code
```

### Error Handling
1. Check if Ollama is running
2. If model not found, return setup instructions
3. If generation fails, retry once
4. If still fails, return error with Figma JSON for manual processing

## Performance Requirements

### Response Times  
- Figma file fetch: < 5 seconds
- AI code generation: < 25 seconds (phi3-mini on CPU)
- Total conversion: < 30 seconds
- Faster with GPU: < 15 seconds possible

### Scalability
- Single-user tool (MVP)
- Handle designs up to 50 components
- Process one conversion at a time
- Future: Queue system for multiple requests

### Optimization Strategies
- Simplify Figma JSON before sending to LLM
- Use shorter prompts (< 2000 tokens)
- Run Ollama with GPU if available (10x faster)
- No caching needed for MVP

## Security Considerations

### Authentication & Authorization
- No user authentication (single-user tool)
- Figma token stored client-side only (localStorage)
- No token validation on server (user's responsibility)

### Data Privacy
- No persistent storage (stateless)
- No logging of design data
- All processing happens locally
- Figma token never leaves user's browser (sent in API requests only)

### API Security
- CORS: Allow localhost only
- Basic input validation
- No SQL injection risk (no database)
- Sanitize code output before rendering

## Error Handling

### Error Categories
1. **User Errors**: Invalid input, auth failures (400-series)
2. **System Errors**: Server issues, AI failures (500-series)
3. **External Errors**: Figma API issues, rate limits (502/503)

### Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    suggestions?: string[];
  };
  requestId: string;
  timestamp: string;
}
```

## Testing Strategy

### Unit Tests
- Test individual functions (parsers, generators)
- Mock external APIs (Figma, OpenAI)
- Target: 80%+ code coverage

### Integration Tests
- Test end-to-end conversion flow
- Test with real Figma designs (test fixtures)
- Validate generated code compiles

### Quality Checks
- Generated code passes ESLint
- Generated code passes TypeScript compiler
- Visual regression testing (optional)

## Monitoring & Observability

### Metrics to Track
- Conversion success rate
- Average conversion time
- AI API costs per conversion
- User satisfaction ratings
- Error rates by category

### Logging
```typescript
logger.info('Conversion started', {
  userId,
  jobId,
  figmaFileKey,
  config
});

logger.error('Conversion failed', {
  userId,
  jobId,
  error: error.message,
  stack: error.stack
});
```

## Deployment

### Environment Variables
```bash
# Minimal configuration
PORT=3000                              # Server port
OLLAMA_URL=http://localhost:11434     # Ollama API endpoint
NODE_ENV=production                    # Optional
```

### Local Development
```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull model
ollama pull phi3:mini

# 3. Start Ollama (in separate terminal)
ollama serve

# 4. Install dependencies
npm install

# 5. Start dev server
npm run dev

# 6. Open browser
http://localhost:3000
```

### Production Deployment (On-Premises)
```bash
# Option 1: Native installation
1. Install Node.js 20+
2. Install Ollama
3. Clone repo
4. npm install && npm run build
5. npm start

# Option 2: Docker (future)
docker-compose up -d

# Option 3: Company foundry
- Deploy as internal web app
- Ensure Ollama is accessible
- No external internet required (after model download)
```

## Future Technical Enhancements
- **Model Upgrades**: Try llama3:8b, codellama, or qwen2.5-coder for better code quality
- **GPU Acceleration**: Add CUDA support for 10x faster generation
- **Batch Processing**: Process multiple Figma frames in parallel
- **VS Code Extension**: Right-click Figma URL → Generate code
- **Fine-tuning**: Fine-tune model on React/Tailwind examples
- **Docker Image**: Pre-built container with Ollama + models
- **Figma Plugin**: Export designs directly from Figma
- **Component Library Adapters**: Map to Material-UI, Chakra UI components
