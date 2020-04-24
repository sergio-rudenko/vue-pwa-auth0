module.exports = {
  devServer: {
    port: 3000,
  },
  pwa: {
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      swSrc: "src/service-worker.js",
      exclude: [/\.map$/, /manifest\.json$/],
    },
    themeColor: "#1da025",
  },
};
