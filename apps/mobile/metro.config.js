const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = {
  watchFolders: [monorepoRoot],
  resolver: {
    // Ensure we resolve node_modules from the monorepo root
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(monorepoRoot, "node_modules"),
    ],
    // Block other apps from being watched
    blockList: [
      new RegExp(path.resolve(monorepoRoot, "apps/web").replace(/[/\\]/g, "[/\\\\]") + "/.*"),
      new RegExp(path.resolve(monorepoRoot, "contracts").replace(/[/\\]/g, "[/\\\\]") + "/.*"),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
