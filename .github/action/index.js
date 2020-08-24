const core = require("@actions/core");
const github = require("@actions/github");

try {
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`Hi ${github.context.actor}`);
  console.log(payload)
  const octokit = github.getOctokit(env.GITHUB_TOKEN)
  octokit.issues.getComment(github.context.payload.comment.id).then(val => console.log(`comment value`, val)).catch(err => log(err))

} catch (error) {
  core.setFailed(error.message);
}