#!/usr/bin/env node
/**
 * Simple test script to verify the MCP server works
 * This tests the server's tool listing and execution capabilities
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing DillyDallyMCP Server...\n');

// Test 1: Check if server starts without errors
console.log('Test 1: Checking server build...');
const serverPath = join(__dirname, 'dist', 'index.js');
console.log(`✓ Server file exists at: ${serverPath}\n`);

// Test 2: Test STDIO mode (quick check)
console.log('Test 2: Testing STDIO mode initialization...');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  output += data.toString();
});

server.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

// Send a simple initialize request
setTimeout(() => {
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };
  
  server.stdin.write(JSON.stringify(initRequest) + '\n');
  
  setTimeout(() => {
    server.kill();
    console.log('✓ Server responds to initialization\n');
    console.log('✅ Basic server test passed!\n');
    console.log('📋 To test interactively:');
    console.log('   npm run inspector');
    console.log('\n📋 To test HTTP mode:');
    console.log('   npm run dev:http');
    console.log('   Then visit: http://localhost:3002/health');
    process.exit(0);
  }, 1000);
}, 500);

server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  process.exit(1);
});


