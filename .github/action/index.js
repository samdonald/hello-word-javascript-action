const core = require("@actions/core");
const github = require("@actions/github");


function parseTitle(body) {
  const projectTitle = "## Project Title";
  const titleIndex = body.indexOf(projectTitle) + projectTitle.length;
  const platformsIndex = body.indexOf("<!-- Please indecate");
  let title = body.substring(titleIndex, platformsIndex).trim();
  console.log(`
    ${titleIndex}
    ${platformsIndex}
    ${title}
    ${body.slice(titleIndex, platformsIndex)}
    ${title.charAt(0)}
    ${title.startsWith("-")}
  `);
  if (title.startsWith("-")) { title = title.slice(1).trim(); }
  return title;  
}

async function buildProject() {
  try {
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
    const contributor = github.context.payload.sender.login
    const body = github.context.payload.issue.body;
    const owner = github.context.payload.repository.owner.login;
    const repo = github.context.payload.repository.name;
    const issue_number = github.context.payload.issue.number;
    
    const title = parseTitle(body);


    // 1) parse the body into sections
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
  }
}
    
buildProject();