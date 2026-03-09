import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { convertFigmaToReact } from './services/figmaService.js';

// Load environment variables
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    ollama: 'checking...',
    timestamp: new Date().toISOString()
  });
});

// Main conversion endpoint
app.post('/api/convert', async (req, res) => {
  try {
    const { figmaUrl, figmaToken, outputFormat = 'tsx' } = req.body;

    // Validate input
    if (!figmaUrl || !figmaToken) {
      return res.status(400).json({ 
        error: 'Missing required fields: figmaUrl and figmaToken' 
      });
    }

    console.log('🚀 Starting conversion for:', figmaUrl);

    // Convert Figma design to React code
    const result = await convertFigmaToReact(figmaUrl, figmaToken, outputFormat);

    console.log('✅ Conversion successful!');

    res.json({
      success: true,
      code: result.code,
      componentName: result.componentName,
      warnings: result.warnings || []
    });

  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Figma to React Backend Server Running   ║
╚════════════════════════════════════════════╝

🚀 Server: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
🔄 API:    http://localhost:${PORT}/api/convert

⚙️  Make sure Ollama is running:
   > ollama serve

💡 Ready to convert Figma designs!
  `);
});
