const Cache = require("@11ty/eleventy-cache-assets");

module.exports = async function() {
  // https://developer.github.com/v3/repos/#get
  let json = await Cache("https://api.github.com/repos/luwes/sinuous", {
    duration: "15m",
    type: "json" // also supports "text" or "buffer"
  });

  return {
    stargazers: json.stargazers_count
  };
};
