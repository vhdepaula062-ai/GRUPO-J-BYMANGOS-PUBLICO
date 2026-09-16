import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'apps/customer-mobile/android');
const mobileReq = createRequire(path.join(rootDir, 'apps/customer-mobile/package.json'));

console.log('--- ETAPA 3: VALIDAÇÃO DO CAMINHO ---');

const rnPkg = mobileReq.resolve('react-native/package.json');
const gradlePluginPkg = mobileReq.resolve('@react-native/gradle-plugin/package.json', { paths: [rnPkg] });

console.log('1. react-native package:', rnPkg);
console.log('2. gradle-plugin package:', gradlePluginPkg);
const pluginDir = path.dirname(gradlePluginPkg);
const settingsJar = path.join(pluginDir, 'settings-plugin/build/libs/settings-plugin.jar');
console.log('3. settings-plugin.jar exists:', fs.existsSync(settingsJar), 'at:', settingsJar);

// Test resolve-paths.js
const { execSync } = await import('child_process');
const resolveOutput = execSync('node resolve-paths.js', { cwd: androidDir, encoding: 'utf8' });
console.log('4. resolve-paths.js output:');
console.log(resolveOutput);

const hasJ = resolveOutput.includes('J:') || resolveOutput.includes('J:\\') || resolveOutput.includes('J:/');
console.log('5. Contains J: drive reference:', hasJ ? 'FAIL (contains J:)' : 'PASS (no J:)');

const resolvedGradleDir = JSON.parse(resolveOutput).gradlePluginDir;
console.log('6. Relative gradlePluginDir from rootDir:', resolvedGradleDir);
const combinedDir = path.resolve(androidDir, resolvedGradleDir);
console.log('7. Combined physical dir:', combinedDir);
console.log('8. Combined dir exists:', fs.existsSync(combinedDir));
