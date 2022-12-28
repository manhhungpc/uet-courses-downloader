"use strict";

const { merge } = require("webpack-merge");

const { common, product, development } = require("./webpack.common.js");
const PATHS = require("./paths");

// Merge webpack configuration files
const config = (env, argv) =>
    merge(common, argv.mode === "production" ? product : development, {
        entry: {
            popup: [PATHS.src + "/popup.js", PATHS.src + "/popup.css"],
            contentScript: PATHS.src + "/contentScript.js",
        },
        devtool: argv.mode === "production" ? false : "source-map",
    });

module.exports = config;
