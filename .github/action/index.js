const core = require("@actions/core");
const github = require("@actions/github");

try {
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`Hi ${github.context.actor}`);
  console.log(payload)
} catch (error) {
  core.setFailed(error.message);
}