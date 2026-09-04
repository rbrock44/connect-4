// Fails the build if the production bundle grows past a budget. There's no
// Angular CLI budget config here (this is the one React/Vite repo in the
// portfolio), so this is the equivalent: it runs as a postbuild step and
// checks the gzipped size of everything Vite emitted into dist/assets.
//
// Budget was set just above the measured size at the time this was added
// (JS ~68KB gzip, CSS ~6KB gzip, ~74KB total). Bump JS_BUDGET_KB /
// CSS_BUDGET_KB deliberately if a real feature needs the room - don't raise
// them to silence a regression you haven't looked at.
import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS_DIR = join(import.meta.dirname, '..', 'dist', 'assets');
const JS_BUDGET_KB = 100;
const CSS_BUDGET_KB = 15;

function gzipKb(filePath) {
    const contents = readFileSync(filePath);
    return gzipSync(contents).length / 1024;
}

function checkGroup(label, extension, budgetKb) {
    const files = readdirSync(ASSETS_DIR).filter(f => f.endsWith(extension));

    if (files.length === 0) {
        console.warn(`bundle size check: no .${extension} files found in dist/assets - skipping ${label} check`);
        return true;
    }

    const totalKb = files.reduce((sum, file) => sum + gzipKb(join(ASSETS_DIR, file)), 0);
    const status = totalKb <= budgetKb ? 'OK' : 'OVER BUDGET';

    console.log(`${label}: ${totalKb.toFixed(1)} KB gzipped (budget ${budgetKb} KB) - ${status}`);

    return totalKb <= budgetKb;
}

try {
    statSync(ASSETS_DIR);
} catch {
    console.error(`bundle size check: ${ASSETS_DIR} does not exist - run the build first`);
    process.exit(1);
}

const jsOk = checkGroup('JS', '.js', JS_BUDGET_KB);
const cssOk = checkGroup('CSS', '.css', CSS_BUDGET_KB);

if (!jsOk || !cssOk) {
    console.error('\nbundle size check failed: build output exceeds its budget');
    process.exit(1);
}
