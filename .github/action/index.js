const core = require("@actions/core");
const github = require("@actions/github");

function getProjectTitle(body) {

  return title;
}

try {
  const body = github.context.payload.issue.body
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)

  const owner = github.context.payload.repository.owner.login;
  const repo = github.context.payload.repository.name;
  const issue_number = github.context.payload.issue.number;
  const contributor = github.context.payload.sender.login;
  
  const project_title = getProjectTitle(body);


  octokit.issues.createComment({
    owner,
    repo,
    issue_number,
    body: `@${contributor} Thanks for contributing!` 
  })
    .then(({data, headers, status}) => console.log(status, data))
    .then(() => octokit.issues.update({
      owner,
      repo,
      issue_number,
      assignees: [owner],
      labels: ["new project"],
      title: `[project] Bone Saw by @${contributor}`
    }))
  
} catch (error) {
  core.setFailed(error.message);
}