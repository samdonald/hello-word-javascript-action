const core = require("@actions/core");
const github = require("@actions/github");
const utils = require("./utils");
const fs = require("fs");


const octokit = github.getOctokit(process.env.TOKEN);
const owner = github.context.payload.repository.owner.login;
const issue_number = github.context.payload.issue.number;
const repo = github.context.payload.repository.name;

const createComment = (body) => octokit.issues.createComment({
  owner,
  repo,
  issue_number,
  body
});

const findSection = text => sectionTitle => endOfSection => {
  const start = text.indexOf(sectionTitle) + sectionTitle.length;
  if (endOfSection === "") {
    return text.substring(start).trim();
  } else {
    return text.substring(start, text.indexOf(endOfSection)).trim();
  }
};

function parseTitle(body) {
  const title = findSection(body)("## Project Title")("## Platform Support");
  if (title.match(/^[a-z0-9 ]+$/i)) {
    return utils.capitalise(title);
  }
  throw new Error("title");
}

function parseDescription(body) {
  const description = findSection(body)("## Description")("## Resources");

  if (description !== "") {
    return description;
  }

  throw new Error("description");
}

function parseResources(body) {
  const resources = findSection(body)("## Resources")("## Playgrounds");
  if (resources !== "") {
    return resources;
  }
  throw new Error("resources");
}

function parsePlaygrounds(body) {
  const playgrounds = findSection(body)("## Playgrounds")("");
  if (playgrounds) {
    return playgrounds;
  }
  throw new Error("playgrounds");
}

async function parseComment() {
  try {
    // const file = ;
    // get working issue from metadata from file
    // if sender is same as issue creator pay attention, else don't.
    if (github.context.payload.sender.login !== File.issue.contributor) {
      throw new Error("Invalid Contributor");
    } else {
      console.log("Comment to parse")
      // 1. identify if a comment from the contributor was requested
      // 1.1. does this comment follow the requested comment.
      // 2. id what type of content to look for.
      // 3. parse comment for content
      // 4. update project content if found or reply to contributor that the information could not be found.
    }
  } catch (error) {
    console.log(error.message)
  }
}

try {
  const contributor = github.context.payload.sender.login;

  switch (github.context.action) {
    case "opened":
      projectSubmitted();
      break;
    case "created":
      parseComment();
      break;
  }

  async function projectSubmitted() {
    try {
      const body = utils.stripComments(github.context.payload.issue.body);
      const title = parseTitle(body);

      if (!fs.existsSync(`${title}`)) {
        console.log("File does not exist.")
        fs.mkdir(`${title}`, err => {
          if (err) {
            console.log(err);
            return err
          } else {
            fs.writeFile(`./${title}/README.md`, `## ${title}`, err => {
              if (err) {
                console.log(err);
                return err;
              } else {
                console.log("Directory and file saved.");
                return;
              }
            });
          }
        });
      } else {
        console.log(`File (${title}) exists.`)
      }
      // const description = parseDescription(body);
      // const resources = parseResources(body);
      // const playgrounds = parsePlaygrounds(body);
      // const ios = utils.platformSupport(body)("ios");
      // const android = utils.platformSupport(body)("android");
      
      // core.setOutput("title", title);
      // core.setOutput("description", description);
      // core.setOutput("resources", resources);
      // core.setOutput("javascript", playgrounds.javascript);
      // core.setOutput("typescript", playgrounds.typescript);
      // core.setOutput("angular", playgrounds.angular);
      // core.setOutput("vue", playgrounds.vue);
      // core.setOutput("react", playgrounds.react);
      // core.setOutput("svelte", playgrounds.svelte);
      // core.setOutput("ios", ios)
      // core.setOutput("android", android);

      // if (!(ios + android)) {
      //   throw new Error("platform");
      // }
      
    } catch (error) {
      switch (error.message) {
        case "title":
          await createComment(
            `@${contributor} I could not parse your title. Please reply with a short descriptive alphanumeric title.`
          );
          break;
        case "description":
          break;
        case "resources":
          break;
        case "playground":
          break;
        case "platform":
          await createComment(
            `@${contributor} It looks like you have not indicated what platforms your project supports.\r\rDoes your project support ***iOS***?\r\r*(Please reply **Yes** or **No**)*`
          );
          break;
      }
    }
  };

} catch (error) {
  console.log(error.message);
}
