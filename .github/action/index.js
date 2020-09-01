const core = require("@actions/core");
const github = require("@actions/github");
const utils = require("./utils");
const fs = require("fs");

const octokit = github.getOctokit(process.env.token);
const owner = github.context.payload.repository.owner.login;
const issue_number = github.context.payload.issue.number;
const repo  = github.context.payload.repository.name;

const getSection = text => (from, to = "") => {
  const start = text.indexOf(from) + from.length;
  return to === ""
    ? text.substring(start).trim()
    : text.substring(start, text.indexOf(to)).trim();
}

const extractTitle = text => {
  const title = getSection(text)("## Project Title", "## Platform Support")
  return title.match(/^[a-z0-9 ]+$/i) ? utils.capitalise(title) : null;
};

const extractDescription = text => {
  const description = getSection(text)("## Description", "## Resources");
  return description !== "" ? description : null;
}

const extractResources = text => {
  const resources = getSection(text)("## Resources", "## Playgrounds");
  return resources;
}

const extractPlatformSupport = text => platform => {
  const platforms = getSection(text)("## Platform Support", "## Description");
  return utils.platformSupport(platforms)(platform);
}

const extractPlaygrounds = text => {
  const section = getSection(text)("## Playgrounds");
  const url = "play.nativescript.org/?template=play-";
  const exp = new RegExp(/(play.nativescript.org\/\?template\=play-(?:js|tsc|ng|react|vue|svelte)\&id\=(?:\w)+\&v\=(?:\d)+)|[^]/, "g");
  const playgrounds = section.split(" ")
    .filter(playground => playground.includes(url))
    .map(url => url.replace(exp, "$1"));

  if (playgrounds.length < 1) return null;

  return playgrounds.reduce((obj, item) => {
    const start = item.indexOf("play-") + 5;
    const flavour = item.substring(start, item.indexOf("&id"));
    obj[flavour] = item;
    return obj;
  }, {});
}


switch (github.context.payload.action) {
  case "opened":
    projectSubmission();
    break;
  case "created":
    console.log("NEW COMMENT");
    break;
}


async function projectSubmission() {
  try {
    const body = utils.stripComments(github.context.payload.issue.body);
    const title = extractTitle(body);

    if (!fs.existsSync(`projects/${title}`)) {
      const description = extractDescription(body);
      const resources = extractResources(body);
      const ios = extractPlatformSupport(body)("ios");
      const android = extractPlatformSupport(body)("android");
      const playgrounds = extractPlaygrounds(body);
      
      // all minimum requirements in place
      if (title && description && playgrounds && (ios + android)) {
        const data = 
        `[JavaScript]: https://img.shields.io/badge/JavaScript-%E2%9C%93-F7DF1E.svg?logo=JavaScript&logoColor=F7DF1E&labelColor=000000
        
[Playground (JavaScript)]: ${playgrounds.js}
        
## ${title}

### Description
${description}

### Related Resources
${resources}

### Playgrounds
| [Playground (JavaScript)] |
| --- |
| [![JavaScript]][Playground (JavaScript)] |`;

        const directory = await fs.promises.mkdir(`projects/${title}`, { recursive: true });
        const file = await fs.promises.writeFile(`projects/${title}/README.md`, data);
        await octokit.issues.update({
          owner,
          repo,
          issue_number,
          title: `[project] ${title}`,
        })
      }
    } else {
      console.log("Directory already exists");
    }

  } catch (error) {
    console.log(error);
  }
}
