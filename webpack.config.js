const path = require("path");

module.exports = {
  mode: "production",
  target: "node",
  entry: "./src/index.ts",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "umd",
    clean: true,
  },
  resolve: {
    extensions: [".ts"],
    fallback: {
      querystring: false,
      http: false,
      url: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts)?$/,
        use: ["ts-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true,
  },
};
