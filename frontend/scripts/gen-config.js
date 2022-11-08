const fs = require("fs")
if (process.argv[2] !== undefined &&
  (process.env["SHORT_API_BASE"] == undefined
    || process.env["SHORT_BASE_URL"] == undefined)) {
  console.error("For building you need to set SHORT_API_BASE and SHORT_BASE_URL environment variables.")
  fs.rmSync("./src/config.json")
  process.exit(-1)
} else {
  var config = {
    api_base: process.env["SHORT_API_BASE"] || "http://localhost:3001",
    base_url: process.env["SHORT_BASE_URL"] || "https://pbid.io"
  }

  fs.writeFileSync("./src/config.json", JSON.stringify(config))
}



