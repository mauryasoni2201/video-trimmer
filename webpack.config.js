const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode:"development",
  entry: "./src/index.js",
  experiments: {
    outputModule: true
  },
  output: {
    filename: "main.js",
    libraryTarget: "module",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()]
};
