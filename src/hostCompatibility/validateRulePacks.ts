import { alphaHostRulePacks } from "./packs/index.js";
import { validateHostRulePack } from "./validate.js";

let failed = false;

for (const pack of alphaHostRulePacks) {
  const issues = validateHostRulePack(pack);
  if (issues.length === 0) {
    console.log(`ok ${pack.packId}@${pack.packVersion} (${pack.rules.length} rules)`);
    continue;
  }

  failed = true;
  console.error(`invalid ${pack.packId}@${pack.packVersion}`);
  for (const issue of issues) {
    console.error(`  ${issue.path}: ${issue.message}`);
  }
}

const totalRules = alphaHostRulePacks.reduce((sum, pack) => sum + pack.rules.length, 0);
console.log(`validated ${alphaHostRulePacks.length} host packs / ${totalRules} rules`);

if (failed) {
  process.exitCode = 1;
}
