import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getConvexClient, getConvexApi } from "../lib/convexClient.js";

/**
 * Tool definition for getting attention metrics
 */
export const getAttentionMetricsToolDefinition: Tool = {
  name: "get_attention_metrics",
  description: "Get attention/focus metrics from camera snapshots for a specific session or the most recent session. Returns attention state breakdown, focus percentage, and time spent looking at screen.",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "Optional: Specific session ID. If not provided, uses the most recent session.",
      },
    },
    required: [],
  },
};

/**
 * Handles the get_attention_metrics tool call
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleGetAttentionMetrics(
  args: unknown
): Promise<CallToolResult> {
  try {
    const { sessionId } = (args as { sessionId?: string }) || {};
    const client = getConvexClient();
    const api = await getConvexApi();

    const metrics = await client.query(api.functions.getAttentionMetrics, {
      sessionId: sessionId as any,
    });

    if (!metrics) {
      return {
        content: [
          {
            type: "text",
            text: "No attention metrics available. No sessions found.",
          },
        ],
        isError: false,
      };
    }

    if (metrics.totalSnapshots === 0) {
      return {
        content: [
          {
            type: "text",
            text: `Session ${metrics.sessionId} has no camera snapshots.`,
          },
        ],
        isError: false,
      };
    }

    const result = {
      sessionId: metrics.sessionId,
      totalSnapshots: metrics.totalSnapshots,
      focusPercentage: `${metrics.focusPercentage}%`,
      lookingAtScreenCount: metrics.lookingAtScreenCount,
      awayCount: metrics.awayCount,
      noFaceCount: metrics.noFaceCount,
      attentionStates: metrics.attentionStates,
      summary: `Out of ${metrics.totalSnapshots} camera snapshots, ${metrics.focusPercentage}% showed the user looking at the screen.`,
    };

    return {
      content: [
        {
          type: "text",
          text: `Attention Metrics:\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching attention metrics: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}

