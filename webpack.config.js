const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    index: "./src/index.js",
    open: "./src/open.js",
    loops: "./src/loops.js",
    balloon: "./src/balloon.js",
    synth: "./src/synth.js",
    gait: "./src/gait.js",
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].js",
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: {
          loader: "html-loader",
          options: { minimize: false }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js.map$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      name: "index",
      template: "./src/index.html",
      filename: "index.html",
      chunks: ['index']
    }),
    new HtmlWebPackPlugin({
      name: "open",
      filename: 'open.html',
      template: 'src/open.html',
      chunks: ['open']
    }),
    new HtmlWebPackPlugin({
      name: "loops",
      filename: 'loops.html',
      template: 'src/loops.html',
      chunks: ['loops']
    }),
    new HtmlWebPackPlugin({
      name: "balloon",
      filename: 'balloon.html',
      template: 'src/balloon.html',
      chunks: ['balloon']
    }),
    new HtmlWebPackPlugin({
      name: "synth",
      filename: 'synth.html',
      template: 'src/loops.html',
      chunks: ['synth']
    }),
    new HtmlWebPackPlugin({
      name: "gait",
      filename: 'gait.html',
      template: 'src/loops.html',
      chunks: ['gait']
    }),
  ],
  module: {  // If I remove this, webpack fails. \(~n~)/
    rules: [
    ],
  },
  devtool: "source-map",
}