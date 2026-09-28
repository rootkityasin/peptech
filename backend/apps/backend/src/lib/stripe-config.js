// Development loader for medusa-config.js. Production emits stripe-config.ts as JS.
require("ts-node").register({ transpileOnly: true, project: require("node:path").resolve(__dirname, "../../tsconfig.json") })
module.exports = require("./stripe-config.ts")
