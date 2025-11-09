#!/usr/bin/env node

/**
 * Test script for Dedalus MCP Server HTTP mode
 * Tests all available tools including the new ones
 */

import fetch from "node-fetch";

const SERVER_URL = "http://localhost:3002";

interface McpRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: unknown;
}

interface McpResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

let requestId = 1;

function createRequest(method: string, params?: unknown): McpRequest {
  return {
    jsonrpc: "2.0",
    id: requestId++,
    method,
    params,
  };
}

async function sendRequest(request: McpRequest): Promise<McpResponse> {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as McpResponse;
  } catch (error) {
    throw new Error(`Failed to send request: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function testMcpServer(): Promise<void> {
  console.log("🧪 Testing Dedalus MCP Server (HTTP Mode)...\n");
  console.log(`📍 Server URL: ${SERVER_URL}\n`);

  try {
    // Test 1: Initialize
    console.log("📋 Test 1: Initialize server");
    const initRequest = createRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0",
      },
    });
    const initResponse = await sendRequest(initRequest);
    if (initResponse.error) {
      console.log(`   ⚠️  Initialize response: ${JSON.stringify(initResponse.error)}`);
    } else {
      console.log("   ✅ Server initialized\n");
    }

    // Test 2: List tools
    console.log("📋 Test 2: List available tools");
    const listToolsRequest = createRequest("tools/list");
    const listToolsResponse = await sendRequest(listToolsRequest);
    
    if (listToolsResponse.error) {
      console.log(`   ❌ Error: ${JSON.stringify(listToolsResponse.error)}`);
    } else {
      const tools = (listToolsResponse.result as { tools: Array<{ name: string; description: string }> })?.tools || [];
      console.log(`   ✅ Found ${tools.length} tool(s):\n`);
      tools.forEach((tool) => {
        console.log(`      - ${tool.name}: ${tool.description.substring(0, 60)}...`);
      });
      console.log();
    }

    // Test 3: Test add_integers tool
    console.log("📋 Test 3: Call add_integers tool (5 + 3)");
    const addIntegersRequest = createRequest("tools/call", {
      name: "add_integers",
      arguments: {
        a: 5,
        b: 3,
      },
    });
    const addIntegersResponse = await sendRequest(addIntegersRequest);
    
    if (addIntegersResponse.error) {
      console.log(`   ❌ Error: ${JSON.stringify(addIntegersResponse.error)}`);
    } else {
      const content = (addIntegersResponse.result as { content: Array<{ text: string }> })?.content;
      const text = content?.[0]?.text || "No result";
      console.log(`   ✅ Result: ${text}\n`);
    }

    // Test 4: Test get_current_user tool
    console.log("📋 Test 4: Call get_current_user tool");
    const getCurrentUserRequest = createRequest("tools/call", {
      name: "get_current_user",
      arguments: {},
    });
    const getCurrentUserResponse = await sendRequest(getCurrentUserRequest);
    
    if (getCurrentUserResponse.error) {
      console.log(`   ⚠️  Error (expected if not authenticated): ${JSON.stringify(getCurrentUserResponse.error)}`);
    } else {
      const content = (getCurrentUserResponse.result as { content: Array<{ text: string }> })?.content;
      const text = content?.[0]?.text || "No result";
      console.log(`   ✅ Result: ${text.substring(0, 200)}...\n`);
    }

    // Test 5: Test get_all_sessions tool
    console.log("📋 Test 5: Call get_all_sessions tool");
    const getAllSessionsRequest = createRequest("tools/call", {
      name: "get_all_sessions",
      arguments: {},
    });
    const getAllSessionsResponse = await sendRequest(getAllSessionsRequest);
    
    if (getAllSessionsResponse.error) {
      console.log(`   ⚠️  Error (expected if not authenticated): ${JSON.stringify(getAllSessionsResponse.error)}`);
    } else {
      const content = (getAllSessionsResponse.result as { content: Array<{ text: string }> })?.content;
      const text = content?.[0]?.text || "No result";
      console.log(`   ✅ Result: ${text.substring(0, 200)}...\n`);
    }

    // Test 6: Test get_weekly_insights tool
    console.log("📋 Test 6: Call get_weekly_insights tool");
    const getWeeklyInsightsRequest = createRequest("tools/call", {
      name: "get_weekly_insights",
      arguments: {},
    });
    const getWeeklyInsightsResponse = await sendRequest(getWeeklyInsightsRequest);
    
    if (getWeeklyInsightsResponse.error) {
      console.log(`   ⚠️  Error (expected if not authenticated): ${JSON.stringify(getWeeklyInsightsResponse.error)}`);
    } else {
      const content = (getWeeklyInsightsResponse.result as { content: Array<{ text: string }> })?.content;
      const text = content?.[0]?.text || "No result";
      console.log(`   ✅ Result: ${text.substring(0, 200)}...\n`);
    }

    console.log("✨ All tests completed!\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer(): Promise<boolean> {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 0,
        method: "ping",
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Run tests
(async () => {
  console.log("🔍 Checking if server is running...\n");
  const isRunning = await checkServer();
  
  if (!isRunning) {
    console.error(`❌ Server is not running at ${SERVER_URL}`);
    console.error("   Please start the server with: npm run dev:http");
    process.exit(1);
  }

  await testMcpServer();
})();


