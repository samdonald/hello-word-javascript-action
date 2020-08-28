const core = require("@actions/core");
const github = require("@actions/github");

try {
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
  const contributor = github.context.payload.sender.login;
  const owner = github.context.payload.repository.owner.login;
  const repo = github.context.payload.repository.name;
  const issue_number = github.context.payload.issue.number;
  const body = github.context.payload.issue.body;

  const createComment = (body) => octokit.issues.createComment({
    owner,
    repo,
    issue_number,
    body
  });

  function parseTitle(body) {
    const projectTitle = "## Project Title";
    const titleIndex = body.indexOf(projectTitle) + projectTitle.length;
    const platformsIndex = body.indexOf("## Platform Support");
    const title = body.substring(titleIndex, platformsIndex).trim();
    
    if (title.match(/^[a-z0-9 ]+$/i)) {
      return title;
    }

    throw new Error("Invalid Title");
  }

  (async function buildProject(body) {
    try {
      // determin what event triggered the action
      console.log(github.context)
      const title = parseTitle(body);
      // const ios = parseIos(body);
      // const android = parseAndroid(body);
      // const description = parseDescription(body);
      // const resources = parseResources(body);
      // const playgrounds = parsePlaygrounds(body);

      // if (ios == false && android == false) {
      //   // request platform support status
      // }
      
      await octokit.issues.lock({owner,repo,issue_number});
    } catch (error) {
      switch (error.message) {
        case "Invalid Title":
          await createComment(
            `@${contributor} I could not parse your title. Please reply with a short descriptive alphanumeric title.`
          );
          break;
        case "No Support":
          await createComment(
            `@${contributor} It looks like you have not indicated what platforms your project supports.\r\r Does your project support ***iOS***?\r\r*(Please reply **Yes** or **No**)*`
          )
        default:
          break;
      }
    }
  })(body);

} catch (error) {
  console.log(error.message);
}
