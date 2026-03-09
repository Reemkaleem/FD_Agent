/**
 * Build the AI prompt for code generation
 */
export function buildPrompt(designData, outputFormat) {
  const isTypeScript = outputFormat === 'tsx';

  const systemPrompt = `You are an expert React and Tailwind CSS developer.
Your task is to convert Figma design data into production-ready React components.

RULES:
1. Generate functional React components (${isTypeScript ? 'TSX with TypeScript' : 'JSX'})
2. Use Tailwind CSS classes for ALL styling (no inline styles)
3. Preserve the component name from Figma
4. Create semantic HTML elements (button, input, etc.)
5. Output ONLY the code, no explanations or markdown
6. ${isTypeScript ? 'Include TypeScript interfaces for props' : 'Use plain JavaScript'}
7. Use modern React patterns (hooks, functional components)

OUTPUT FORMAT:
- Start with imports
- ${isTypeScript ? 'Define prop interface' : 'Add PropTypes if needed'}
- Export the component function
- No extra text before or after code`;

  const userPrompt = `Convert this Figma design to React:

${JSON.stringify(designData, null, 2)}

Generate a complete ${isTypeScript ? 'TypeScript React' : 'React'} component with Tailwind CSS.`;

  // Combine system and user prompts
  return `${systemPrompt}

---

${userPrompt}`;
}

/**
 * Example few-shot prompt (for better results with more context)
 */
export function buildFewShotPrompt(designData, outputFormat) {
  const isTypeScript = outputFormat === 'tsx';
  
  const example = `
EXAMPLE INPUT:
{
  "name": "PrimaryButton",
  "type": "FRAME",
  "layout": { "width": 120, "height": 40 },
  "backgroundColor": "#3b82f6",
  "borderRadius": 8,
  "children": [
    {
      "type": "TEXT",
      "text": "Click Me",
      "fontSize": 14,
      "fontWeight": 600
    }
  ]
}

EXAMPLE OUTPUT:
${isTypeScript ? `
interface PrimaryButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
}

export function PrimaryButton({ onClick, children = "Click Me" }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-[120px] h-10 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-sm text-white flex items-center justify-center"
    >
      {children}
    </button>
  );
}
` : `
export function PrimaryButton({ onClick, children = "Click Me" }) {
  return (
    <button
      onClick={onClick}
      className="w-[120px] h-10 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-sm text-white flex items-center justify-center"
    >
      {children}
    </button>
  );
}
`}

---

NOW YOUR TURN:

INPUT:
${JSON.stringify(designData, null, 2)}

OUTPUT (code only):`;

  return example;
}
