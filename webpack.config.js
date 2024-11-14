const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { env, argv } = require("process");

let config = {
    mode: "development",
    entry: {
        main: "./src/main.ts",
        selection: "./src/selection.ts"
    },
    devServer: {
        https: false,
        port: 8080,
        static: path.resolve(__dirname, "dist"),
        open: true,
        hot: true,
        watchFiles: ["src/**/*"],
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                },
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.s[ac]ss$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output. Both options are optional
            filename: "[name].css",
            chunkFilename: "[id].css",
        }),
        new CopyPlugin({
            patterns: [
                { from: "src/html", to: "" },
                { from: "src/style", to: "" },
                { from: "src/res", to: "res" }
            ],
        }),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
};

module.exports = (env, argv) => {
    if (argv.mode !== "production") {
        config.devtool = "inline-source-map";
    }

    return config;
};
