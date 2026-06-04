import { listKnowledgeItems, describeKnowledgeSource } from './lib/knowledge.js';
import { incrementAndGetRuns } from './lib/run-counter.js';
import { getCurrentUser } from './lib/auth.js';

function printDemo() {
  const source = describeKnowledgeSource();
  const user = getCurrentUser();
  const runs = incrementAndGetRuns();
  const items = listKnowledgeItems();

  console.log(`Hackathon demo (cli)`);
  console.log(`Signed in as ${user.name} (${user.role}) — local-only, no real auth.`);
  console.log(``);
  console.log(`Data source: ${source.label}`);
  console.log(`Run count (local): ${runs}`);
  console.log(``);
  console.log(`Sample items:`);
  for (const item of items) {
    console.log(`  - ${item.title}`);
    console.log(`      ${item.body}`);
    if (item.tags.length > 0) {
      console.log(`      tags: ${item.tags.join(', ')}`);
    }
  }
}

try {
  printDemo();
} catch (err) {
  console.error(`Demo failed: ${err.message}`);
  process.exit(1);
}
