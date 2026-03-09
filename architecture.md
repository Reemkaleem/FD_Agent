# Architecture Document: Figma to React AI Converter

## System Architecture Overview

```
┌──────────────────────────────────────────────┐
│         User's Browser (Frontend)           │
│              React + Vite                    │
│  ┌────────────────────────────────────────┐ │
│  │  Input: Figma URL + Token              │ │
│  │  Output: Generated React Code          │ │
│  │  Storage: localStorage (token only)    │ │
│  └────────────────────────────────────────┘ │
└──────────────────┬───────────────────────────┘
                   │ HTTP/REST
                   │ (localhost:3000)
                   │
┌──────────────────▼───────────────────────────┐
│          Backend API Server                  │
│          (Node.js/Express)                   │
│  ┌────────────────────────────────────────┐ │
│  │  POST /api/convert                     │ │
│  │  - Parse Figma URL                     │ │
│  │  - Call Figma API                      │ │
│  │  - Call Ollama for code generation     │ │
│  │  - Return React code                   │ │
│  └────────────────────────────────────────┘ │
└────────┬─────────────────────┬───────────────┘
         │                     │
         │                     │
 ┌───────▼────────┐    ┌──────▼──────────────┐
 │  Figma API     │    │  Ollama Server      │
 │  (External)    │    │  (Local)            │
 │  figma.com     │    │  localhost:11434    │
 │                │    │  Model: phi3:mini   │
 └────────────────┘    └─────────────────────┘

              NO DATABASE
              NO REDIS CACHE
              NO AUTHENTICATION SERVICE
              NO CLOUD SERVICES
```

## Simplified Architecture

This is a **simple 2-tier web application**:

1. **Frontend**: Single-page React app (static files)
2. **Backend**: Lightweight API server (3 endpoints)
3. **Dependencies**: Figma API + Ollama (local LLM)

**What's NOT included (by design):**
- ❌ No database
- ❌ No user authentication
- ❌ No session management
- ❌ No caching layer
- ❌ No message queues
- ❌ No microservices
- ❌ No cloud deployment

## Architecture Patterns

### Simple Request-Response Architecture

The system follows a straightforward **stateless request-response** pattern:

1. **User Action**: Paste Figma URL, click "Generate"
2. **Frontend**: Send POST request with URL + token
3. **Backend**: 
   - Validate input
   - Fetch from Figma API
   - Parse JSON
   - Call Ollama
   - Return generated code
4. **Frontend**: Display code, enable copy/download

### No Complex Patterns Needed
- ❌ No microservices (single monolith is fine)
- ❌ No event-driven architecture
- ❌ No CQRS or event sourcing
- ❌ No saga patterns
- ✅ Simple synchronous REST calls

## Core Components Deep Dive

### Frontend Architecture (React SPA)

```
src/
├── App.tsx                    # Main app component
├── components/
│   ├── URLInput.tsx           # Figma URL input field
│   ├── TokenInput.tsx         # Figma token input (saved to localStorage)
│   ├── GenerateButton.tsx     # Submit button
│   ├── CodeDisplay.tsx        # Monaco editor or textarea
│   ├── ErrorMessage.tsx       # Error display
│   └── LoadingSpinner.tsx     # Loading state
├── api/
│   └── client.ts              # API call functions
├── types/
│   └── index.ts               # TypeScript types
└── utils/
    └── storage.ts             # localStorage helpers
```

#### State Management (Simple useState)
```typescript
function App() {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [figmaToken, setFigmaToken] = useState(
    localStorage.getItem('figmaToken') || ''
  );
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ figmaUrl, figmaToken })
      });
      
      const data = await response.json();
      setGeneratedCode(data.code);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    // UI components...
  );
}
```

### Backend Architecture (Node.js/Express)

```
src/
├── index.ts                   # Entry point, start server
├── routes/
│   └── convert.ts             # API routes
├── services/
│   ├── figmaService.ts        # Figma API client
│   ├── ollamaService.ts       # Ollama client
│   └── codeGenerator.ts       # Code generation logic
├── utils/
│   ├── urlParser.ts           # Extract file key from URL
│   ├── jsonSimplifier.ts      # Simplify Figma JSON
│   └── promptBuilder.ts       # Build LLM prompts
└── types/
    └── index.ts               # Shared types
```

#### API Route Handler
```typescript
app.post('/api/convert', async (req, res) => {
  try {
    const { figmaUrl, figmaToken, outputFormat = 'tsx' } = req.body;
    
    // 1. Parse URL
    const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
    
    // 2. Fetch from Figma
    const figmaData = await fetchFigmaDesign(fileKey, nodeId, figmaToken);
    
    // 3. Simplify JSON
    const simplified = simplifyFigmaJSON(figmaData);
    
    // 4. Generate code with Ollama
    const code = await generateCode(simplified, outputFormat);
    
    // 5. Return result
    res.json({
      success: true,
      code,
      componentName: figmaData.name,
      warnings: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

## Data Architecture

### Domain Models

#### Design Node Model
```typescript
class DesignNode {
  id: string;
  type: NodeType;
  name: string;
  bounds: BoundingBox;
  styles: ComputedStyle;
  children: DesignNode[];
  parent: DesignNode | null;
  
  // Methods
  isComponent(): boolean;
  getPath(): string;
  toReactComponent(): string;
}
```

#### Component Model
```typescript
class Component {
  name: string;
  type: ComponentType;
  props: PropDefinition[];
  children: Component[];
  styles: StyleObject;
  
  // Methods
  toJSX(): string;
  toTypeScript(): string;
  getDependencies(): string[];
}
```

### Database Schema Design

#### Entity Relationship Diagram
```
┌──────────────┐         ┌────────────────────┐
│    Users     │ 1     * │ ConversionJobs     │
│──────────────│─────────│────────────────────│
│ id (PK)      │         │ id (PK)            │
│ email        │         │ user_id (FK)       │
│ created_at   │         │ figma_file_key     │
└──────────────┘         │ status             │
       │                 │ config             │
       │                 │ result_url         │
       │                 └────────────────────┘
       │
       │ 1
       │
       │ *
┌──────────────────┐     ┌────────────────────┐
│ FigmaConnections │     │ UserConfigurations │
│──────────────────│     │────────────────────│
│ id (PK)          │     │ id (PK)            │
│ user_id (FK)     │     │ user_id (FK)       │
│ access_token     │     │ config_name        │
│ refresh_token    │     │ config (JSON)      │
│ expires_at       │     │ is_default         │
└──────────────────┘     └────────────────────┘
```

## AI Integration Architecture

### Figma JSON → React Code Pipeline

```
┌──────────────────┐
│  Figma JSON      │ Full design tree (verbose)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  JSON Simplifier │ Extract relevant data only
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Simplified JSON │ {name, type, layout, styles, children}
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Prompt Builder  │ Construct LLM prompt
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│  Ollama + phi3:mini          │
│  Text-only LLM               │
│  (No vision model needed!)   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────┐
│  Raw LLM Output  │ Generated code (may have formatting issues)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Code Parser     │ Extract code blocks, validate syntax
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  React Code      │ Final output: clean .tsx/.jsx
└──────────────────┘
```

### Why No Vision Model?

Figma API provides **structured JSON**, not just images:
- Exact positions, sizes, colors
- Component names and hierarchy
- Text content and styles
- Layout constraints

**This is BETTER than vision models because:**
- ✅ More accurate (exact values, not estimated)
- ✅ Faster (no image processing)
- ✅ Smaller model (phi3-mini vs llava:13b)
- ✅ Lower cost (text tokens cheaper than image tokens)

### Prompt Engineering Strategy

#### System Prompt
```
You are an expert React and Tailwind CSS developer.
Your task is to convert Figma design data into production-ready React components.

Rules:
1. Generate functional React components (TSX)
2. Use Tailwind CSS for all styling
3. Preserve component names from Figma
4. Create semantic HTML elements
5. Output ONLY the code, no explanations
6. Use TypeScript interfaces for props
```

#### User Prompt Template
```typescript
function buildPrompt(figmaJSON: any, config: Config): string {
  return `
Convert this Figma design to React:

{
  "name": "${figmaJSON.name}",
  "type": "${figmaJSON.type}",
  "layout": ${JSON.stringify(figmaJSON.layout, null, 2)},
  "styles": ${JSON.stringify(figmaJSON.styles, null, 2)},
  "children": ${JSON.stringify(figmaJSON.children, null, 2)}
}

Requirements:
- Output format: ${config.outputFormat}
- Use Tailwind CSS classes
- Add TypeScript types: ${config.useTypeScript}

Generate the complete component code now.
  `.trim();
}
```

#### Example Input/Output

**Input (Simplified Figma JSON):**
```json
{
  "name": "LoginButton",
  "type": "FRAME",
  "layout": {
    "width": 200,
    "height": 48,
    "padding": 16,
    "justifyContent": "center",
    "alignItems": "center"
  },
  "styles": {
    "backgroundColor": "#3B82F6",
    "borderRadius": 8,
    "color": "#FFFFFF"
  },
  "children": [
    {
      "type": "TEXT",
      "text": "Log In",
      "fontSize": 16,
      "fontWeight": 600
    }
  ]
}
```

**Output (Generated React Code):**
```typescript
interface LoginButtonProps {
  onClick?: () => void;
}

export function LoginButton({ onClick }: LoginButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-[200px] h-12 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold flex items-center justify-center"
    >
      Log In
    </button>
  );
}
```

## Code Generation Architecture

### Generation Pipeline Stages

```
Input (AI Analysis)
        │
        ▼
┌─────────────────────┐
│ 1. Preprocessing    │
│ - Validate input    │
│ - Normalize data    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Component Tree   │
│ - Build hierarchy   │
│ - Identify patterns │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. JSX Generation   │
│ - Create elements   │
│ - Add attributes    │
│ - Nest children     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4. Style Generation │
│ - Extract styles    │
│ - Apply methodology │
│ - Generate classes  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 5. Type Generation  │
│ - Infer prop types  │
│ - Create interfaces │
│ - Add annotations   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 6. Import Resolution│
│ - Gather deps       │
│ - Organize imports  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 7. Code Formatting  │
│ - Run Prettier      │
│ - Validate syntax   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 8. File Packaging   │
│ - Organize files    │
│ - Create structure  │
└──────────┬──────────┘
           │
           ▼
    Generated Code
```

### Code Templates

#### Component Template (TSX)
```typescript
interface ComponentTemplate {
  imports: string[];
  interfaceDefinition?: string;
  componentFunction: string;
  exports: string;
}

function generateComponentFile(
  component: Component,
  config: ProjectConfig
): string {
  const template: ComponentTemplate = {
    imports: generateImports(component, config),
    interfaceDefinition: config.features.typescript
      ? generateInterface(component)
      : undefined,
    componentFunction: generateComponentFunction(component, config),
    exports: generateExports(component)
  };
  
  return formatComponentFile(template);
}
```

## Security Architecture

### Authentication Flow

```
┌──────────┐                    ┌──────────┐
│  Client  │                    │   API    │
└─────┬────┘                    └─────┬────┘
      │                               │
      │ 1. Request OAuth URL          │
      │─────────────────────────────> │
      │                               │
      │ 2. Return Figma OAuth URL     │
      │ <───────────────────────────  │
      │                               │
      │ 3. Redirect to Figma          │
      │─────────────────────────────> │
      │                               │
      │ 4. User authorizes            │
      │                               │
      │ 5. Figma redirects with code  │
      │ <───────────────────────────  │
      │                               │
      │ 6. Send code to API           │
      │─────────────────────────────> │
      │                               │
      │    7. Exchange code for token │
      │         (API -> Figma)        │
      │                               │
      │ 8. Store token, return JWT    │
      │ <───────────────────────────  │
      │                               │
      │ 9. Store JWT, authenticated   │
      │                               │
```

### Security Layers

1. **Transport Security**: TLS 1.3 for all connections
2. **Authentication**: JWT with short expiration (1 hour)
3. **Authorization**: Role-based access control (RBAC)
4. **Input Validation**: Schema validation with Zod
5. **Rate Limiting**: Token bucket algorithm
6. **Data Encryption**: AES-256 for sensitive data at rest

## Scalability Architecture

### Horizontal Scaling Strategy

```
                    ┌──────────────┐
                    │ Load Balancer│
                    │   (Nginx)    │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │ API     │      │ API     │      │ API     │
    │ Server 1│      │ Server 2│      │ Server 3│
    └────┬────┘      └────┬────┘      └────┬────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                    ┌──────▼───────┐
                    │  Redis       │
                    │  (Shared     │
                    │   Cache)     │
                    └──────────────┘
                           │
                    ┌──────▼───────┐
                    │  PostgreSQL  │
                    │  (Primary +  │
                    │   Replicas)  │
                    └──────────────┘
```

### Caching Strategy

1. **L1 Cache**: In-memory cache per server (LRU, 5 min TTL)
2. **L2 Cache**: Redis distributed cache (15 min TTL)
3. **CDN**: Static assets and generated code archives

### Performance Optimization

- **Connection Pooling**: Database connection pool (max 20)
- **Request Batching**: Batch Figma API requests
- **Lazy Loading**: Load design components on-demand
- **Code Splitting**: Frontend code splitting by route
- **Worker Threads**: CPU-intensive tasks in worker pools

## Monitoring & Observability Architecture

### Metrics Collection
```typescript
// Key metrics to track
interface Metrics {
  // Performance
  conversionDuration: Histogram;
  apiResponseTime: Histogram;
  aiApiLatency: Histogram;
  
  // Business
  conversionsPerDay: Counter;
  successRate: Gauge;
  activeUsers: Gauge;
  
  // Resources
  cpuUsage: Gauge;
  memoryUsage: Gauge;
  dbConnections: Gauge;
  
  // Errors
  errorRate: Counter;
  errorsByType: Counter;
}
```

### Logging Strategy
- **Structured JSON logging** with correlation IDs
- **Log levels**: DEBUG, INFO, WARN, ERROR
- **Retention**: 30 days for errors, 7 days for info
- **Aggregation**: ELK stack or Cloud logging

## Deployment Architecture

### Local Development Setup

```
Developer Machine
├── Terminal 1: Ollama Server
│   $ ollama serve
│   Listening on localhost:11434
│
├── Terminal 2: Backend API
│   $ cd backend && npm run dev
│   Server running on localhost:3000
│
└── Terminal 3: Frontend Dev Server
    $ cd frontend && npm run dev
    
 Vite running on localhost:5173
    
 Backend proxied to localhost:3000
```

### Production Deployment (On-Premises)

```
Company Server
├── /opt/figma-to-react/
│   ├── ollama/               # Ollama installation
│   │   └── models/phi3:mini  # Downloaded model (~2.3GB)
│   │
│   ├── backend/              # Node.js API (built)
│   │   ├── dist/
│   │   ├── node_modules/
│   │   └── package.json
│   │
│   └── frontend/             # React app (static build)
│       └── dist/             # Served by backend
│
├── systemd service: figma-converter.service
│   - Starts Ollama
│   - Starts Node.js backend
│   - Serves frontend on port 3000
│
└── Nginx reverse proxy (optional)
    - SSL termination
    - Custom domain
```

### System Requirements

**Minimum:**
- CPU: 4 cores
- RAM: 8GB
- Disk: 5GB (Ollama + model)
- OS: Linux, macOS, or Windows (WSL2)
- Node.js 20+

**Recommended:**
- CPU: 8 cores
- RAM: 16GB
- GPU: NVIDIA GPU with 6GB+ VRAM (10x faster)
- Disk: 10GB SSD
- OS: Ubuntu 22.04 LTS

**Network:**
- Internet required for:
  - Initial setup (download Ollama, dependencies, model)
  - Figma API calls (during conversion)
- After setup: Can work in air-gapped environment (if Figma designs cached)

## Performance Optimization

### Bottlenecks & Solutions

| Bottleneck | Impact | Solution |
|------------|--------|----------|
| Ollama inference slow (CPU) | 20-30s per generation | Use GPU (NVIDIA) → 2-3s |
| Figma API slow | 3-5s per request | Cache responses in-memory (optional) |
| Large Figma designs | Timeout, out of memory | Limit to 50 components, simplify JSON |
| Figma rate limiting | API errors | Retry with exponential backoff |
| phi3-mini code quality | Incorrect/buggy code | Upgrade to llama3:8b or codellama |

### GPU Acceleration

```bash
# Install CUDA drivers (NVIDIA GPU)
# Ollama automatically uses GPU if available

# Verify GPU is being used
ollama serve
# Look for: "Using GPU: NVIDIA GeForce..."

# Speed improvement:
# CPU (8 cores): ~25s per generation
# GPU (RTX 3060): ~2.5s per generation
# 10x faster!
```

## Future Architecture Enhancements

### Phase 2 (If Needed)
1. **Model Upgrades**: Llama3:8b, Qwen2.5-Coder, DeepSeek-Coder
2. **Caching Layer**: Redis for Figma API responses
3. **Queue System**: Bull/BullMQ for handling multiple requests
4. **Docker**: Containerize entire stack with docker-compose
5. **VS Code Extension**: Direct integration with editor
6. **Figma Plugin**: Export designs without URL/token

### Phase 3 (Advanced)
1. **Multi-User**: Add authentication and user sessions
2. **Database**: Store conversion history, favorite configs
3. **Fine-Tuned Model**: Custom model trained on React/Tailwind examples
4. **Real-time Collaboration**: WebSocket for team features
5. **Cloud Option**: Optional SaaS version for non-enterprise users

### Scalability Path

If demand grows:
- **Horizontal Scaling**: Multiple backend instances behind load balancer
- **Ollama Cluster**: Dedicated LLM inference servers
- **Microservices**: Split into Figma service, AI service, API gateway
- **Kubernetes**: Container orchestration for auto-scaling
