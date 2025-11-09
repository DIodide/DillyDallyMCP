import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getConvexClient, getConvexApi } from "../lib/convexClient.js";

/**
 * Tool definition for getting session snapshots
 */
export const getSessionSnapshotsToolDefinition: Tool = {
  name: "get_session_snapshots",
  description: "Get all activity snapshots for a specific session. Returns screenshots with activity analysis, productivity status, summaries, and timestamps.",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "The session ID to get snapshots for",
      },
    },
    required: ["sessionId"],
  },
};

/**
 * Handles the get_session_snapshots tool call
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleGetSessionSnapshots(
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

    const snapshots = await client.query(api.functions.getSessionSnapshots, {
      sessionId: sessionId as any,
    });

    if (!snapshots || snapshots.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No snapshots found for session ${sessionId}.`,
          },
        ],
        isError: false,
      };
    }

    const formattedSnapshots = snapshots.map((snapshot: any) => {
      const date = new Date(snapshot.timestamp);
      return {
        id: snapshot._id,
        timestamp: date.toISOString(),
        readableTime: date.toLocaleString(),
        activity: snapshot.activity,
        isProductive: snapshot.isProductive ? "Yes" : "No",
        summary: snapshot.summary,
        currentTab: snapshot.currentTab,
        hasImage: !!snapshot.imageBase64,
      };
    });

    const result = {
      sessionId,
      snapshotCount: snapshots.length,
      snapshots: formattedSnapshots,
    };

    return {
      content: [
        {
          type: "text",
          text: `Session Snapshots:\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching session snapshots: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}


