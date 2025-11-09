# DillyDallyMCP

A Model Context Protocol (MCP) server ready for Dedalus deployment.

## Setup

### 1. Initialize Git Repository

```bash
cd dedalus-mcp
git init
git add .
git commit -m "Initial commit: Dedalus MCP server"
```

### 2. Create Remote Repository

Create a new repository on GitHub/GitLab/etc. named `DillyDallyMCP`, then:

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

### 3. Configure Environment Variables

Create a `.env.local` file in the `dedalus-mcp` folder:

```bash
CONVEX_URL=https://your-deployment.convex.cloud
```

You can find your Convex URL in:
- The monorepo root `.env.local` file (if running locally)
- Your Convex dashboard
- By running `npx convex dev` from the monorepo root

**Note:** The `.env.local` file is gitignored and should not be committed.

### 4. Install Dependencies

```bash
npm install
```

### 5. Build

```bash
npm run build
```

## Testing Locally

### STDIO Mode (for MCP clients)
```bash
npm run dev:stdio
```

### HTTP Mode (for testing/debugging)
```bash
npm run dev:http
```

The server will start on `http://localhost:3002`

### Using MCP Inspector

```bash
npm run build
npm run inspector
```

## Deployment to Dedalus

This server follows Dedalus deployment standards:
- ✅ Entry point: `src/index.ts` (or `index.ts` at root)
- ✅ TypeScript server structure
- ✅ Proper package.json configuration

Simply connect your repository to Dedalus and it will automatically detect and deploy the MCP server.

## Project Structure

```
dedalus-mcp/
├── index.ts              # Main entry point
├── server.ts             # MCP server implementation
├── cli.ts                # CLI argument parsing
├── lib/                  # Shared utilities
│   └── convexClient.ts  # Convex client setup
├── tools/                # MCP tools
│   ├── index.ts
│   ├── addIntegers.ts
│   ├── getRecentActivity.ts
│   ├── getLastSession.ts
│   ├── getProductivityStats.ts
│   ├── getSessionDetails.ts
│   └── getAttentionMetrics.ts
├── transport/            # Transport implementations
│   ├── index.ts
│   ├── http.ts
│   └── stdio.ts
├── package.json
├── tsconfig.json
└── .env.local            # Environment variables (create this)
```

## Available Tools

- `add_integers`: Adds two integers together
- `get_recent_activity`: Get recent activity snapshots from DillyDally
- `get_last_session`: Get details of the most recent DillyDally session
- `get_productivity_stats`: Get productivity statistics over a time range
- `get_session_details`: Get detailed information about a specific session
- `get_attention_metrics`: Get attention/focus metrics from camera snapshots

## License

MIT
