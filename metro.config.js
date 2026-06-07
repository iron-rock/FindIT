const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const path = require('path');

/** @type {import('metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname);

const defaultResolveRequest = config.resolver?.resolveRequest;

config.resolver = {
  ...config.resolver,
  assetExts: [...(config.resolver?.assetExts ?? []), 'webm'],
  resolveRequest: (context, moduleName, platform) => {
    // i18next@26 exports указывают на dist/esm, которого Metro не находит — берём CJS.
    if (moduleName === 'i18next') {
      return {
        filePath: path.resolve(__dirname, 'node_modules/i18next/dist/cjs/i18next.js'),
        type: 'sourceFile',
      };
    }

    if (defaultResolveRequest) {
      return defaultResolveRequest(context, moduleName, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
