import type { HostRulePack } from "../types.js";
import { claudeRulePack } from "./claude.js";
import { geminiCliRulePack } from "./geminiCli.js";
import { openaiChatgptRulePack } from "./openaiChatgpt.js";

export const alphaHostRulePacks: HostRulePack[] = [
  openaiChatgptRulePack,
  claudeRulePack,
  geminiCliRulePack,
];

export { claudeRulePack, geminiCliRulePack, openaiChatgptRulePack };
