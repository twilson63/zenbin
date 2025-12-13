import { Hono } from 'hono';
import { config } from '../config.js';

const landing = new Hono();

const getHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZenBin — Headless HTML Sandbox</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :root {
      --bg: #0a0a0a;
      --surface: #141414;
      --border: #2a2a2a;
      --text: #e5e5e5;
      --text-muted: #888;
      --accent: #10b981;
      --accent-dim: #065f46;
    }
    
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 4rem 2rem;
    }
    
    header {
      text-align: center;
      margin-bottom: 4rem;
    }
    
    .logo {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }
    
    .tagline {
      color: var(--text-muted);
      font-size: 1.25rem;
    }
    
    .description {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 3rem;
    }
    
    .description p {
      color: var(--text-muted);
      font-size: 1.1rem;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }
    
    .feature {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text);
      font-size: 0.95rem;
    }
    
    .feature::before {
      content: "✓";
      color: var(--accent);
      font-weight: bold;
    }
    
    h2 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      color: var(--text);
    }
    
    .api-section {
      margin-bottom: 2.5rem;
    }
    
    .endpoint {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 1rem;
      overflow: hidden;
    }
    
    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border);
    }
    
    .method {
      font-family: monospace;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
    }
    
    .method.post {
      background: var(--accent-dim);
      color: var(--accent);
    }
    
    .method.get {
      background: #1e3a5f;
      color: #60a5fa;
    }
    
    .path {
      font-family: monospace;
      font-size: 0.95rem;
      color: var(--text);
    }
    
    .endpoint-desc {
      padding: 1rem 1.25rem;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    
    .code-block {
      background: #0d0d0d;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.25rem;
      overflow-x: auto;
      margin-top: 1rem;
    }
    
    .code-block code {
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-size: 0.85rem;
      color: var(--text);
      white-space: pre;
    }
    
    .code-block .comment {
      color: var(--text-muted);
    }
    
    .code-block .string {
      color: #a5d6ff;
    }
    
    .try-it {
      margin-top: 3rem;
      text-align: center;
      padding: 2rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
    }
    
    .try-it p {
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
    
    .try-it code {
      font-family: monospace;
      background: var(--bg);
      padding: 0.75rem 1rem;
      border-radius: 6px;
      display: inline-block;
      font-size: 0.9rem;
    }
    
    footer {
      margin-top: 4rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    
    footer a {
      color: var(--accent);
      text-decoration: none;
    }
    
    footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">🗑️</div>
      <h1>ZenBin</h1>
      <p class="tagline">Headless HTML Sandbox</p>
    </header>
    
    <section class="description">
      <p>
        ZenBin is a simple API for publishing and sharing HTML documents. 
        Post your HTML to an ID, get a shareable URL back. Perfect for demos, 
        prototypes, reports, and AI-generated content.
      </p>
      <div class="features">
        <div class="feature">Instant publishing</div>
        <div class="feature">No signup required</div>
        <div class="feature">Sandboxed rendering</div>
        <div class="feature">ETag caching</div>
      </div>
    </section>
    
    <section class="api-section">
      <h2>API Reference</h2>
      
      <div class="endpoint">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <span class="path">/v1/pages/{id}</span>
        </div>
        <div class="endpoint-desc">
          Create or replace an HTML page. Returns the view URL.
        </div>
      </div>
      
      <div class="endpoint">
        <div class="endpoint-header">
          <span class="method get">GET</span>
          <span class="path">/p/{id}</span>
        </div>
        <div class="endpoint-desc">
          View a published page in the browser with security headers.
        </div>
      </div>
      
      <div class="endpoint">
        <div class="endpoint-header">
          <span class="method get">GET</span>
          <span class="path">/p/{id}/raw</span>
        </div>
        <div class="endpoint-desc">
          Fetch the raw HTML content as plain text.
        </div>
      </div>
      
      <div class="endpoint">
        <div class="endpoint-header">
          <span class="method get">GET</span>
          <span class="path">/api/agent</span>
        </div>
        <div class="endpoint-desc">
          Get markdown instructions for AI agents.
        </div>
      </div>
    </section>
    
    <section class="api-section">
      <h2>Quick Example</h2>
      <div class="code-block"><code><span class="comment"># Publish a page</span>
curl -X POST ${config.baseUrl}/v1/pages/hello \\
  -H <span class="string">"Content-Type: application/json"</span> \\
  -d <span class="string">'{"html":"&lt;h1&gt;Hello World&lt;/h1&gt;"}'</span>

<span class="comment"># Response</span>
{
  "id": "hello",
  "url": "${config.baseUrl}/p/hello",
  "raw_url": "${config.baseUrl}/p/hello/raw"
}</code></div>
    </section>
    
    <section class="try-it">
      <p>Your page will be available at:</p>
      <code>${config.baseUrl}/p/<strong>{your-id}</strong></code>
    </section>
    
    <footer>
      <p>
        <a href="/api/agent">Agent Instructions</a> · 
        Max ${Math.round(config.maxPayloadSize / 1024)}KB per page · 
        IDs: A-Za-z0-9._-
      </p>
    </footer>
  </div>
</body>
</html>`;

// GET / - Landing page
landing.get('/', (c) => {
  c.header('Content-Type', 'text/html; charset=utf-8');
  return c.body(getHtml());
});

export { landing };
