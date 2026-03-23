import { TOOL_SWAP_TO_DEFAULT_AGENT_FULL_NAME } from "./archestra-mcp-server";

/**
 * Prefix for agent delegation tools.
 * Format: agent__<slugified_agent_name>
 * These are dynamically generated and are not Archestra MCP tools.
 */
export const AGENT_TOOL_PREFIX = "agent__";

/** Maximum number of suggested prompts per agent */
export const MAX_SUGGESTED_PROMPTS = 10;

/** Maximum character length for a suggested prompt's summary title (button label) */
export const MAX_SUGGESTED_PROMPT_TITLE_LENGTH = 50;

/** Maximum character length for a suggested prompt's full prompt text */
export const MAX_SUGGESTED_PROMPT_TEXT_LENGTH = 5000;

/**
 * Check if a tool name is an agent delegation tool (agent__<name>).
 */
export function isAgentTool(toolName: string): boolean {
  return toolName.startsWith(AGENT_TOOL_PREFIX);
}

export const SWAP_AGENT_POKE_TEXT =
  "(Agent was swapped. Please continue the conversation.)";
export const SWAP_AGENT_POKE_PREFIX = "(Switched to ";
export const SWAP_AGENT_POKE_AGENT_NAME_SUFFIX =
  ". Please continue the conversation.";
export const SWAP_AGENT_FAILED_POKE_TEXT =
  "(The agent swap failed — you are still the same agent. Briefly explain to the user that the switch did not happen and continue the conversation.)";
export const SWAP_TO_DEFAULT_AGENT_POKE_TEXT =
  "(Switched back to the default agent. Briefly explain why you switched back and continue the conversation.)";

export function makeSwapAgentPokeText(agentName: string): string {
  return `${SWAP_AGENT_POKE_PREFIX}${agentName}${SWAP_AGENT_POKE_AGENT_NAME_SUFFIX} If you have the ${TOOL_SWAP_TO_DEFAULT_AGENT_FULL_NAME} tool and you don't have the right tools to fulfill the request, use it immediately — write a brief message explaining why you are switching back, then call ${TOOL_SWAP_TO_DEFAULT_AGENT_FULL_NAME}.)`;
}

// ---------------------------------------------------------------------------
// Schedule triggers
// ---------------------------------------------------------------------------

/** Supported schedule trigger types */
export type AgentScheduleTriggerType = "cron" | "interval" | "once";

/**
 * A cron-based schedule trigger.
 * `expression` follows standard cron syntax: "minute hour day month weekday"
 */
export interface AgentCronScheduleTrigger {
  type: "cron";
  expression: string;
  /** Optional human-readable label */
  label?: string;
}

/**
 * An interval-based schedule trigger.
 * `intervalMs` is the number of milliseconds between runs.
 */
export interface AgentIntervalScheduleTrigger {
  type: "interval";
  intervalMs: number;
  /** Optional human-readable label */
  label?: string;
}

/**
 * A one-shot schedule trigger that fires at a specific ISO 8601 datetime.
 */
export interface AgentOnceScheduleTrigger {
  type: "once";
  /** ISO 8601 datetime string */
  at: string;
  /** Optional human-readable label */
  label?: string;
}

/** Union of all schedule trigger variants */
export type AgentScheduleTrigger =
  | AgentCronScheduleTrigger
  | AgentIntervalScheduleTrigger
  | AgentOnceScheduleTrigger;

/**
 * Configuration for an agent's schedule trigger, including what prompt
 * to run when the trigger fires.
 */
export interface AgentScheduleTriggerConfig {
  /** Unique identifier for this schedule entry */
  id: string;
  /** The agent identifier (agentId) this schedule belongs to */
  agentId: string;
  /** The trigger definition */
  trigger: AgentScheduleTrigger;
  /** The prompt/message that will be sent to the agent when triggered */
  prompt: string;
  /** Whether this schedule is active */
  enabled: boolean;
  /** ISO 8601 datetime of the last successful run, if any */
  lastRunAt?: string;
  /** ISO 8601 datetime of the next scheduled run, if any */
  nextRunAt?: string;
}

// ---------------------------------------------------------------------------
// Schedule trigger helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if a schedule trigger is currently enabled.
 */
export function isScheduleTriggerEnabled(
  config: AgentScheduleTriggerConfig,
): boolean {
  return config.enabled;
}

/**
 * Returns true if the given trigger is a cron trigger.
 */
export function isCronTrigger(
  trigger: AgentScheduleTrigger,
): trigger is AgentCronScheduleTrigger {
  return trigger.type === "cron";
}

/**
 * Returns true if the given trigger is an interval trigger.
 */
export function isIntervalTrigger(
  trigger: AgentScheduleTrigger,
): trigger is AgentIntervalScheduleTrigger {
  return trigger.type === "interval";
}

/**
 * Returns true if the given trigger is a one-shot trigger.
 */
export function isOnceTrigger(
  trigger: AgentScheduleTrigger,
): trigger is AgentOnceScheduleTrigger {
  return trigger.type === "once";
}

/**
 * Returns a human-readable description of a schedule trigger.
 */
export function describeScheduleTrigger(trigger: AgentScheduleTrigger): string {
  if (trigger.label) {
    return trigger.label;
  }
  switch (trigger.type) {
    case "cron":
      return `Cron: ${trigger.expression}`;
    case "interval":
      return `Every ${trigger.intervalMs}ms`;
    case "once":
      return `Once at ${trigger.at}`;
  }
}

/**
 * Validates a schedule trigger configuration.
 * Returns an array of validation error messages (empty if valid).
 */
export function validateScheduleTrigger(
  trigger: AgentScheduleTrigger,
): string[] {
  const errors: string[] = [];

  switch (trigger.type) {
    case "cron": {
      if (!trigger.expression || trigger.expression.trim() === "") {
        errors.push("Cron expression must not be empty.");
      } else {
        const parts = trigger.expression.trim().split(/\s+/);
        if (parts.length < 5 || parts.length > 6) {
          errors.push(
            "Cron expression must have 5 or 6 space-separated fields.",
          );
        }
      }
      break;
    }
    case "interval": {
      if (!Number.isFinite(trigger.intervalMs) || trigger.intervalMs <= 0) {
        errors.push("intervalMs must be a positive finite number.");
      }
      break;
    }
    case "once": {
      if (!trigger.at || trigger.at.trim() === "") {
        errors.push("'at' must not be empty.");
      } else {
        const d = new Date(trigger.at);
        if (isNaN(d.getTime())) {
          errors.push("'at' must be a valid ISO 8601 datetime string.");
        }
      }
      break;
    }
  }

  return errors;
}