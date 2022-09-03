const Cache = require("@11ty/eleventy-cache-assets");

module.exports = async function() {
  // https://developer.github.com/v3/repos/#get
  let json = await Cache("https://raw.githubusercontent.com/luwes/sinuous/main/packages/sinuous/package.json", {
    duration: "15m",
    type: "json" // also supports "text" or "buffer"
  });

  return json;
};
