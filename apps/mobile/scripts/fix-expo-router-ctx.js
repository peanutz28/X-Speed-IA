/**
 * Monorepo workaround: Metro's transform worker may fail to inline
 * process.env.EXPO_ROUTER_APP_ROOT via babel-preset-expo when packages
 * are hoisted. This script patches the _ctx.*.js files directly so
 * require.context() receives string literals instead of env references.
 */
const fs = require('fs');
const path = require('path');

const files = ['_ctx.js', '_ctx.web.js', '_ctx.ios.js', '_ctx.android.js', '_ctx-html.js'];
const expoRouterDir = path.resolve(__dirname, '..', 'node_modules', 'expo-router');

for (const file of files) {
  const fullPath = path.join(expoRouterDir, file);
  if (!fs.existsSync(fullPath)) continue;

  let source = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  if (source.includes('process.env.EXPO_ROUTER_APP_ROOT')) {
    source = source.replace(/process\.env\.EXPO_ROUTER_APP_ROOT/g, "'../../app'");
    changed = true;
  }
  if (source.includes('process.env.EXPO_ROUTER_IMPORT_MODE')) {
    source = source.replace(/process\.env\.EXPO_ROUTER_IMPORT_MODE/g, "'sync'");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fullPath, source, 'utf8');
    console.log(`patched ${file}`);
  }
}
