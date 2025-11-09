import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getConvexClient, getConvexApi } from "../lib/convexClient.js";

/**
 * Tool definition for getting session camera snapshots
 */
export const getSessionCameraSnapshotsToolDefinition: Tool = {
  name: "get_session_camera_snapshots",
  description: "Get all camera snapshots (face tracking attention states) for a specific session. Returns attention states with timestamps showing when the user was looking at the screen or distracted.",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "The session ID to get camera snapshots for",
      },
    },
    required: ["sessionId"],
  },
};

/**
 * Handles the get_session_camera_snapshots tool call
 * @param {unknown} args - Tool call arguments
 * @returns {Promise<CallToolResult>} Tool call result
 */
export async function handleGetSessionCameraSnapshots(
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

    const cameraSnapshots = await client.query(
      api.functions.getSessionCameraSnapshots,
      {
        sessionId: sessionId as any,
      }
    );

    if (!cameraSnapshots || cameraSnapshots.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No camera snapshots found for session ${sessionId}.`,
          },
        ],
        isError: false,
      };
    }

    const formattedSnapshots = cameraSnapshots.map((snapshot: any) => {
      const date = new Date(snapshot.timestamp);
      return {
        id: snapshot._id,
        timestamp: date.toISOString(),
        readableTime: date.toLocaleString(),
        attentionState: snapshot.attentionState,
        isLookingAtScreen: snapshot.attentionState === "looking_at_screen",
      };
    });

    const lookingAtScreenCount = formattedSnapshots.filter(
      (s: { isLookingAtScreen: boolean }) => s.isLookingAtScreen
    ).length;
    const focusPercentage =
      formattedSnapshots.length > 0
        ? Math.round((lookingAtScreenCount / formattedSnapshots.length) * 100)
        : 0;

    const result = {
      sessionId,
      snapshotCount: cameraSnapshots.length,
      focusPercentage: `${focusPercentage}%`,
      lookingAtScreenCount,
      awayCount: formattedSnapshots.length - lookingAtScreenCount,
      snapshots: formattedSnapshots,
    };

    return {
      content: [
        {
          type: "text",
          text: `Session Camera Snapshots:\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching session camera snapshots: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}

