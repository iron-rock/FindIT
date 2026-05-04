const { getSentryExpoConfig } = require('@sentry/react-native/metro');

/** @type {import('metro-config').MetroConfig} */
module.exports = getSentryExpoConfig(__dirname);
