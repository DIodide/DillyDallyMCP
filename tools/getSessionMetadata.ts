import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getConvexClient, getConvexApi } from "../lib/convexClient.js";

/**
 * Tool definition for getting session metadata
 */
export const getSessionMetadataToolDefinition: Tool = {
  name: "get_session_metadata",
  description: "Get metadata for a specific session including duration, snapshot count, activity count, and productivity percentage. This is a lightweight query that doesn't fetch full snapshot data.",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "The session ID to get metadata for",
      },
    },
    required: ["sessionId"],
  },
};

/**
 * Handles the get_session_metadata tool call
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleGetSessionMetadata(
  args: unknown
): Promise<CallToolResult> {
  try {
    if (!args || typeof args !== "object") {
      return {
        content: [
          {
            type: "text",
            text: "Error: Arguments must be an object with sessionId",
          },
        ],
        isError: true,
      };
    }

    const { sessionId } = args as { sessionId?: unknown };

    if (typeof sessionId !== "string") {
      return {
        content: [
          {
            type: "text",
            text: "Error: sessionId must be a string",
          },
        ],
        isError: true,
      };
    }

    const client = getConvexClient();
    const api = await getConvexApi();

    const metadata = await client.query(api.functions.getSessionMetadata, {
      sessionId: sessionId as any,
    });

    if (!metadata) {
      return {
        content: [
          {
            type: "text",
            text: `No metadata found for session ${sessionId}.`,
          },
        ],
        isError: false,
      };
    }

    const durationMinutes = Math.round(metadata.duration / 60000);
    const durationHours = Math.floor(durationMinutes / 60);
    const remainingMinutes = durationMinutes % 60;

    const result = {
      sessionId,
      duration: `${durationHours}h ${remainingMinutes}m`,
      durationMs: metadata.duration,
      snapshotCount: metadata.snapshotCount,
      activityCount: metadata.activityCount,
      productivityPercentage: `${metadata.productivityPercentage.toFixed(1)}%`,
    };

    return {
      content: [
        {
          type: "text",
          text: `Session Metadata:\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching session metadata: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}


