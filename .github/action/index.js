const core = require("@actions/core");
const github = require("@actions/github");

try {
  const body = github.context.payload.issue.body
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)

  console.log(body.indexOf("## Project Title", 0))
  console.log(JSON.stringify(body), JSON.parse(body));
  
  octokit.issues.createComment({
    owner: github.context.payload.sender.login,
    repo: github.context.payload.repository.name,
    issue_number: github.context.payload.issue.number,
    body: "Hi there" 
  }).then(({data, headers, status}) => console.log(status, data))
  
} catch (error) {
  core.setFailed(error.message);
}