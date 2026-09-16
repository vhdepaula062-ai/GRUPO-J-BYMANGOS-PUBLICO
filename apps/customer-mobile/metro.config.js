const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  monorepoRoot,
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

let searchPaths = [projectRoot, monorepoRoot];
try {
  const expoPkg = require.resolve('expo/package.json', { paths: [projectRoot] });
  searchPaths.push(path.dirname(expoPkg));
} catch {}
try {
  const expoRouterPkg = require.resolve('expo-router/package.json', { paths: [projectRoot] });
  searchPaths.push(path.dirname(expoRouterPkg));
} catch {}

const cache = {};

config.resolver.extraNodeModules = new Proxy({}, {
  get: (target, name) => {
    if (typeof name !== 'string') return target[name];
    if (cache[name]) return cache[name];
    try {
      let resolved;
      try {
        resolved = require.resolve(name, { paths: searchPaths });
      } catch {
        resolved = require.resolve(`${name}/package.json`, { paths: searchPaths });
      }
      let dir = path.dirname(resolved);
      while (dir.length > 3 && !fs.existsSync(path.join(dir, 'package.json'))) {
        dir = path.dirname(dir);
      }
      cache[name] = dir;
      return cache[name];
    } catch {
      return path.join(projectRoot, 'node_modules', name);
    }
  }
});

module.exports = config;
