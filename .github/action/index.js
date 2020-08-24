const core = require("@actions/core");
const github = require("@actions/github");
const { GitHub } = require("@actions/github/lib/utils");

try {
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  const octokit = new GitHub(github.token);
  console.log(`Hi ${github.context.actor}`);
  console.log(payload)
  octokit.issues.getComment(github.context.payload.comment.id)
    .then(val => console.log(`comment value`, val))
    .catch(err => console.log(err))

} catch (error) {
  core.setFailed(error.message);
}