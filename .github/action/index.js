const core = require("@actions/core");
const github = require("@actions/github");

try {
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`Hi ${github.context.actor}`);
  console.log(payload)

  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  octokit.issues.createComment({
    owner: github.context.payload.sender.login,
    repo: github.context.payload.repository.name,
    issue_number: github.context.payload.issue.number,
    body: "Hi there" 
  }).then(({data, headers, status}) => console.log(status, data))
    .catch(error => console.log(error))
  

} catch (error) {
  core.setFailed(error.message);
}