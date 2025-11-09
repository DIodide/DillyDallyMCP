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

    let targetSessionId = sessionId;

    // If no sessionId provided, get the most recent session
    if (!targetSessionId) {
      const sessions = await client.query(api.functions.getAllSessions, {});
      if (!sessions || sessions.length === 0) {
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
      targetSessionId = sessions[0]._id;
    }

    // Get camera snapshots for the session
    const cameraSnapshots = await client.query(api.functions.getSessionCameraSnapshots, {
      sessionId: targetSessionId as any,
    });

    if (!cameraSnapshots || cameraSnapshots.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `Session ${targetSessionId} has no camera snapshots.`,
          },
        ],
        isError: false,
      };
    }

    // Calculate metrics
    const lookingAtScreenCount = cameraSnapshots.filter(
      (s: any) => s.attentionState === "looking_at_screen"
    ).length;
    const awayCount = cameraSnapshots.filter(
      (s: any) => s.attentionState.startsWith("away_")
    ).length;
    const noFaceCount = cameraSnapshots.filter(
      (s: any) => s.attentionState === "no_face"
    ).length;
    const focusPercentage = Math.round((lookingAtScreenCount / cameraSnapshots.length) * 100 * 100) / 100;

    // Count attention states
    const attentionStates: Record<string, number> = {};
    cameraSnapshots.forEach((s: any) => {
      attentionStates[s.attentionState] = (attentionStates[s.attentionState] || 0) + 1;
    });

    const result = {
      sessionId: targetSessionId,
      totalSnapshots: cameraSnapshots.length,
      focusPercentage: `${focusPercentage}%`,
      lookingAtScreenCount: lookingAtScreenCount,
      awayCount: awayCount,
      noFaceCount: noFaceCount,
      attentionStates: attentionStates,
      summary: `Out of ${cameraSnapshots.length} camera snapshots, ${focusPercentage}% showed the user looking at the screen.`,
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

