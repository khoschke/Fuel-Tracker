const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web backend (wa-sqlite) ships a .wasm file that Metro
// needs to treat as an asset rather than try to parse as source.
config.resolver.assetExts.push('wasm');

module.exports = config;
