import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  addIntegersToolDefinition,
  handleAddIntegers,
} from "./addIntegers.js";
import {
  getRecentActivityToolDefinition,
  handleGetRecentActivity,
} from "./getRecentActivity.js";
import {
  getLastSessionToolDefinition,
  handleGetLastSession,
} from "./getLastSession.js";
import {
  getProductivityStatsToolDefinition,
  handleGetProductivityStats,
} from "./getProductivityStats.js";
import {
  getSessionDetailsToolDefinition,
  handleGetSessionDetails,
} from "./getSessionDetails.js";
import {
  getAttentionMetricsToolDefinition,
  handleGetAttentionMetrics,
} from "./getAttentionMetrics.js";

/**
 * Tool registry entry interface
 */
export interface ToolRegistryEntry {
  definition: Tool;
  handler: (args: unknown) => Promise<CallToolResult>;
}

/**
 * Registry of all available tools
 */
export const toolRegistry: Map<string, ToolRegistryEntry> = new Map([
  [
    "add_integers",
    {
      definition: addIntegersToolDefinition,
      handler: handleAddIntegers,
    },
  ],
  [
    "get_recent_activity",
    {
      definition: getRecentActivityToolDefinition,
      handler: handleGetRecentActivity,
    },
  ],
  [
    "get_last_session",
    {
      definition: getLastSessionToolDefinition,
      handler: handleGetLastSession,
    },
  ],
  [
    "get_productivity_stats",
    {
      definition: getProductivityStatsToolDefinition,
      handler: handleGetProductivityStats,
    },
  ],
  [
    "get_session_details",
    {
      definition: getSessionDetailsToolDefinition,
      handler: handleGetSessionDetails,
    },
  ],
  [
    "get_attention_metrics",
    {
      definition: getAttentionMetricsToolDefinition,
      handler: handleGetAttentionMetrics,
    },
  ],
]);

/**
 * Get all tool definitions for listing
 * @returns {Tool[]} Array of tool definitions
 */
export function getAllToolDefinitions(): Tool[] {
  return Array.from(toolRegistry.values()).map((entry) => entry.definition);
}

/**
 * Handle a tool call by name
 * @param {string} name - Tool name
 * @param {unknown} args - Tool arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleToolCall(
  name: string,
  args: unknown
): Promise<CallToolResult> {
  const tool = toolRegistry.get(name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return tool.handler(args);
}

