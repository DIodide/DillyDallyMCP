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
import {
  getAllSessionsToolDefinition,
  handleGetAllSessions,
} from "./getAllSessions.js";
import {
  getWeeklyInsightsToolDefinition,
  handleGetWeeklyInsights,
} from "./getWeeklyInsights.js";
import {
  getSessionSnapshotsToolDefinition,
  handleGetSessionSnapshots,
} from "./getSessionSnapshots.js";
import {
  getSessionCameraSnapshotsToolDefinition,
  handleGetSessionCameraSnapshots,
} from "./getSessionCameraSnapshots.js";
import {
  getSessionActivitiesToolDefinition,
  handleGetSessionActivities,
} from "./getSessionActivities.js";
import {
  getSessionMetadataToolDefinition,
  handleGetSessionMetadata,
} from "./getSessionMetadata.js";
import {
  getCurrentUserToolDefinition,
  handleGetCurrentUser,
} from "./getCurrentUser.js";

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
  [
    "get_all_sessions",
    {
      definition: getAllSessionsToolDefinition,
      handler: handleGetAllSessions,
    },
  ],
  [
    "get_weekly_insights",
    {
      definition: getWeeklyInsightsToolDefinition,
      handler: handleGetWeeklyInsights,
    },
  ],
  [
    "get_session_snapshots",
    {
      definition: getSessionSnapshotsToolDefinition,
      handler: handleGetSessionSnapshots,
    },
  ],
  [
    "get_session_camera_snapshots",
    {
      definition: getSessionCameraSnapshotsToolDefinition,
      handler: handleGetSessionCameraSnapshots,
    },
  ],
  [
    "get_session_activities",
    {
      definition: getSessionActivitiesToolDefinition,
      handler: handleGetSessionActivities,
    },
  ],
  [
    "get_session_metadata",
    {
      definition: getSessionMetadataToolDefinition,
      handler: handleGetSessionMetadata,
    },
  ],
  [
    "get_current_user",
    {
      definition: getCurrentUserToolDefinition,
      handler: handleGetCurrentUser,
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

