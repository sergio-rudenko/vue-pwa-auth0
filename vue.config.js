module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/" : "/",

  devServer: {
    port: 3000,
  },

  pwa: {
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      swSrc: "src/service-worker.js",
      exclude: [/\.map$/, /manifest\.json$/],
    },

    name: "Cloud::Bast auth0",

    themeColor: "#01488A",
    msTileColor: "#000000",

    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black",
  },
};
