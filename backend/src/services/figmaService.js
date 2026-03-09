import fetch from 'node-fetch';
import { generateReactCode } from './ollamaService.js';

/**
 * Parse Figma URL to extract file key and optional node ID
 * Example: https://www.figma.com/file/ABC123/Design-Name?node-id=1:2
 */
export function parseFigmaUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find 'file' in path and get the key after it
    const fileIndex = pathParts.indexOf('file');
    if (fileIndex === -1 || fileIndex + 1 >= pathParts.length) {
      throw new Error('Invalid Figma URL format');
    }
    
    const fileKey = pathParts[fileIndex + 1];
    const nodeId = urlObj.searchParams.get('node-id');
    
    return { fileKey, nodeId };
  } catch (error) {
    throw new Error(`Failed to parse Figma URL: ${error.message}`);
  }
}

/**
 * Fetch design data from Figma API
 */
export async function fetchFigmaDesign(fileKey, token) {
  const url = `https://api.figma.com/v1/files/${fileKey}`;
  
  console.log('📥 Fetching from Figma API...');
  
  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': token
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Figma API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  console.log('✅ Figma data fetched');
  
  return data;
}

/**
 * Simplify Figma JSON to essential properties only
 * This reduces token count for the LLM
 */
export function simplifyFigmaJSON(node, depth = 0) {
  if (!node) return null;
  
  // Base properties we care about
  const simplified = {
    name: node.name,
    type: node.type,
  };

  // Add layout properties if available
  if (node.absoluteBoundingBox) {
    simplified.layout = {
      width: Math.round(node.absoluteBoundingBox.width),
      height: Math.round(node.absoluteBoundingBox.height),
    };
  }

  // Add style properties
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID' && fill.color) {
      const c = fill.color;
      simplified.backgroundColor = rgbToHex(c.r, c.g, c.b);
    }
  }

  if (node.cornerRadius) {
    simplified.borderRadius = node.cornerRadius;
  }

  // Text content
  if (node.type === 'TEXT' && node.characters) {
    simplified.text = node.characters;
    if (node.style) {
      simplified.fontSize = node.style.fontSize;
      simplified.fontWeight = node.style.fontWeight;
    }
  }

  // Layout properties (Figma Auto Layout)
  if (node.layoutMode) {
    simplified.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
  }

  if (node.primaryAxisAlignItems) {
    simplified.justifyContent = node.primaryAxisAlignItems;
  }

  if (node.counterAxisAlignItems) {
    simplified.alignItems = node.counterAxisAlignItems;
  }

  if (node.paddingLeft || node.paddingTop) {
    simplified.padding = {
      left: node.paddingLeft || 0,
      right: node.paddingRight || 0,
      top: node.paddingTop || 0,
      bottom: node.paddingBottom || 0,
    };
  }

  // Recursively simplify children (limit depth to avoid huge JSONs)
  if (node.children && depth < 5) {
    simplified.children = node.children
      .map(child => simplifyFigmaJSON(child, depth + 1))
      .filter(child => child !== null);
  }

  return simplified;
}

/**
 * Convert RGB (0-1) to hex color
 */
function rgbToHex(r, g, b) {
  const toHex = (val) => {
    const hex = Math.round(val * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Main conversion function
 */
export async function convertFigmaToReact(figmaUrl, figmaToken, outputFormat) {
  // Step 1: Parse URL
  console.log('🔍 Parsing Figma URL...');
  const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);

  // Step 2: Fetch from Figma API
  const figmaData = await fetchFigmaDesign(fileKey, figmaToken);
  
  // Step 3: Find the target node (use first page's first frame if no nodeId)
  let targetNode;
  if (nodeId) {
    // TODO: Implement node search by ID
    targetNode = figmaData.document.children[0].children[0];
  } else {
    // Use first frame from first page
    const firstPage = figmaData.document.children[0];
    targetNode = firstPage.children[0];
  }

  if (!targetNode) {
    throw new Error('No design found in Figma file');
  }

  console.log(`📐 Target component: ${targetNode.name}`);

  // Step 4: Simplify JSON
  console.log('🔄 Simplifying design data...');
  const simplifiedDesign = simplifyFigmaJSON(targetNode);
  
  // Step 5: Generate React code using AI
  console.log('🤖 Generating React code with AI...');
  const code = await generateReactCode(simplifiedDesign, outputFormat);

  return {
    code,
    componentName: targetNode.name.replace(/[^a-zA-Z0-9]/g, ''),
    warnings: []
  };
}
