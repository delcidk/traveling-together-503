const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, "../src/lib")];
config.resolver.extraNodeModules = {
  zod: path.resolve(__dirname, "node_modules/zod"),
};
module.exports = config;
