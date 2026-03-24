import { describe, expect, test } from "vitest";
import {
  AGENT_TOOL_PREFIX,
  isAgentTool,
  makeSwapAgentPokeText,
  SWAP_AGENT_POKE_PREFIX,
  validateAgentScheduleTrigger,
  formatScheduleCronExpression,
} from "./agents";
import { TOOL_SWAP_TO_DEFAULT_AGENT_FULL_NAME } from "./archestra-mcp-server";

describe("agent tool helpers", () => {
  test("identifies delegation tools by prefix", () => {
    expect(isAgentTool(`${AGENT_TOOL_PREFIX}delegate_to_researcher`)).toBe(
      true,
    );
    expect(isAgentTool("archestra__swap_agent")).toBe(false);
  });

  test("builds swap poke text using the shared swap-to-default tool name", () => {
    const text = makeSwapAgentPokeText("Research Agent");
    expect(text.startsWith(`${SWAP_AGENT_POKE_PREFIX}Research Agent`)).toBe(
      true,
    );
    expect(text).toContain(TOOL_SWAP_TO_DEFAULT_AGENT_FULL_NAME);
  });
});

describe("agent schedule triggers", () => {
  test("validates required fields", () => {
    expect(validateAgentScheduleTrigger({})).toEqual(["cronExpression is required", "message is required"]);
    expect(validateAgentScheduleTrigger({ cronExpression: "0 * * * *" })).toEqual(["message is required"]);
    expect(validateAgentScheduleTrigger({ message: "Hello" })).toEqual(["cronExpression is required"]);
    expect(validateAgentScheduleTrigger({ cronExpression: "0 * * * *", message: "Hello" })).toEqual([]);
  });

  test("formats common cron expressions", () => {
    expect(formatScheduleCronExpression("* * * * *")).toBe("Every minute");
    expect(formatScheduleCronExpression("0 * * * *")).toBe("Every hour");
    expect(formatScheduleCronExpression("0 0 * * *")).toBe("Every day at midnight");
    expect(formatScheduleCronExpression("0 0 1 * *")).toBe("0 0 1 * *");
  });
});
