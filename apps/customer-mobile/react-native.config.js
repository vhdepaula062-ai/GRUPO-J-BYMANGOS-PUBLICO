const path = require('node:path');

module.exports = {
  dependencies: {
    // SDK 52 loads dependency config from a string. With pnpm's symlink path,
    // Expo's own dependencies cannot be found and the loader silently falls
    // back to the Android namespace (expo.core), which is not the Java package.
    // Resolve the physical package root so Expo's config loads normally.
    expo: {
      root: path.dirname(require.resolve('expo/package.json')),
    },
  },
};
