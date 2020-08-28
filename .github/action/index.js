const core = require("@actions/core");
const github = require("@actions/github");

const octokit = github.getOctokit(process.env.GITHUB_TOKEN)

function parseTitle(body) {
  const projectTitle = "## Project Title";
  const titleIndex = body.indexOf(projectTitle) + projectTitle.length;
  const platformsIndex = body.indexOf("## Platform Support");
  let title = body.substring(titleIndex, platformsIndex).trim();

  if (title.match(/^[a-z0-9 ]+$/i)) {
    return title;
  }

  throw new Error("Invalid Title");
}

async function buildProject() {
  try {
    console.log(github.context.payload);
    const contributor = github.context.payload.sender.login
    const body = github.context.payload.issue.body;
    const owner = github.context.payload.repository.owner.login;
    const repo = github.context.payload.repository.name;
    const issue_number = github.context.payload.issue.number;
    
    // 1) parse the body into sections
    const title = parseTitle(body);
    
    // 2) test each section against criteria

    // If everything in the issue template is correct let the user know the project has been accepted and is awaiting aproval
    const comment = await octokit.issues.createComment({
      owner,
      repo,
      issue_number,
      body: `@${contributor} thanks for the contribution. Once your playground(s) have been checked the project will be accepted.`
    });

    const rename = await octokit.issues.update({ 
      owner,
      repo,
      issue_number,
      title: `[project] ${title} by @${contributor}` 
    });
    
  } catch (error) {
    console.log(error.message)
    switch (error.message) {
      case "Invalid Title":
        octokit.issues.createComment({
          owner,
          repo,
          issue_number,
          body: `@${contributor} I could not parse your title. Please reply with a short descriptive title. It should be a one liner that matches the RegExp **/^[a-z0-9 ]+$/i**\r\rThanks`
        })
        break;
    
      default:
        break;
    }
  }
}
    
buildProject();