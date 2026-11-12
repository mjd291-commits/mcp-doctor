import type { CheckResult } from "./types.js";

type ToolLike = {
  name?: unknown;
  description?: unknown;
  inputSchema?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function inspectTools(
  tools: ToolLike[],
  observationId = "discovery.tools",
): CheckResult[] {
  const checks: CheckResult[] = [];
  const observationIds = [observationId];

  const names = tools
    .map((tool) => (typeof tool.name === "string" ? tool.name : ""))
    .filter(Boolean);

  const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);

  checks.push({
    id: "tools.duplicate-names",
    title: "Tool names are unique",
    status: duplicateNames.length ? "fail" : "pass",
    message: duplicateNames.length
      ? `Duplicate tool names detected: ${[...new Set(duplicateNames)].join(", ")}`
      : "No duplicate tool names detected.",
    observationIds,
  });

  const missingDescriptions = tools.filter(
    (tool) => typeof tool.description !== "string" || tool.description.trim().length < 8,
  );

  checks.push({
    id: "tools.descriptions",
    title: "Tools have useful descriptions",
    status: missingDescriptions.length ? "warn" : "pass",
    message: missingDescriptions.length
      ? `${missingDescriptions.length} tool(s) have missing or very short descriptions.`
      : "All discovered tools have non-trivial descriptions.",
    observationIds,
  });

  const invalidSchemas = tools.filter((tool) => {
    if (!isRecord(tool.inputSchema)) return true;
    const type = tool.inputSchema.type;
    return type !== undefined && type !== "object";
  });

  checks.push({
    id: "tools.input-schema",
    title: "Tool input schemas look structurally valid",
    status: invalidSchemas.length ? "fail" : "pass",
    message: invalidSchemas.length
      ? `${invalidSchemas.length} tool(s) have an absent/non-object input schema or a non-object root type.`
      : "All discovered tool input schemas have an object-compatible root.",
    observationIds,
  });

  const suspiciousNames = names.filter(
    (name) => name.length > 80 || /\s/.test(name) || !/^[A-Za-z0-9_.:-]+$/.test(name),
  );

  checks.push({
    id: "tools.name-hygiene",
    title: "Tool names are host-friendly",
    status: suspiciousNames.length ? "warn" : "pass",
    message: suspiciousNames.length
      ? `Potentially awkward tool names: ${suspiciousNames.join(", ")}`
      : "Tool names use conservative characters and lengths.",
    observationIds,
  });

  return checks;
}
