const core = require("@actions/core");
const github = require("@actions/github");
const utils = require("./utils");
const fs = require("fs");
const yaml = require("js-yaml");


const octokit = github.getOctokit(process.env.token);
const owner = github.context.payload.repository.owner.login;
const issue_number = github.context.payload.issue.number;
const repo  = github.context.payload.repository.name;
const author = {
  id: github.context.payload.sender.id,
  login: github.context.payload.sender.login,
  url: github.context.payload.sender.html_url,
  avatar: github.context.payload.sender.avatar_url,
  date: getDateString(github.context.payload.issue.created_at)
}

const Flavours = {
  js: "JavaScript",
  ng: "Angular",
  tsc: "TypeScript",
  vue: "Vue",
  react: "React",
  svelte: "Svelte"
}

function getDateString(created) {
  // "2020-09-02T"
  const data = created.substring(0, created.indexOf("T")).split("-");
  const date = new Date(data[0], data[1] - 1, data[2]);
  return date.toLocaleDateString(
    "en-AU", 
    { day: "numeric", month: "short", year: "numeric"}
  );
}

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
  const exp = new RegExp(/(play.nativescript.org\/\?template\=play-(?:js|tsc|ng|react|vue|svelte)\&id\=(?:\w)+(?:\&v\=(?:\d)+)?)|[^]/, "g");
  const playgrounds = section.split(" ")
    .filter(playground => playground.includes(url))
    .map(url => url.replace(exp, "$1"));

  if (playgrounds.length < 1) return null;

  return playgrounds.reduce((obj, item) => {
    const start = item.indexOf("play-") + 5;
    const flavour = item.substring(start, item.indexOf("&id"));
    obj[flavour] = `https://${item}`;
    return obj;
  }, {});
}


switch (github.context.payload.action) {
  case "opened":
    projectSubmission();
    break;
  case "created":
    console.log(github.context)
    break;
}

// 1. Get all the project data from the users issue body
// 2. Create the project directory and data.yaml file


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

      const missing = flavour => `This project has no _${flavour}_ playground.`;

      const action = action => flavour => {
        const formattedTitle = title.replace(/( )/g, "+");
        return `[${action === "missing" ? "add" : "update"} playground](https://github.com/mudlabs/hello-word=javascript-action/issues/new/?title=[${action}][${flavour}]%20${formattedTitle}&body=%3C%21%2D%2D+Just+past+your+playground+link+below+and+press+Submit+%2D%2D%3E)`
      };
      
      // all minimum requirements in place
      if (title && description && playgrounds && (ios + android)) {
        const directoryPath = `projects/${title}`;
        const filePath = `${directoryPath}/data.yaml`;
        const projectYAML = buildProjectYml({
          title, ios, android, description, resources, playgrounds
        });
        const directory = await fs.promises.mkdir(directoryPath);
        const file = await fs.promises.writeFile(filePath, projectYAML)
        core.setOutput("status", "ready")
        core.setOutput("project", title);
        return;
      }
    } else {
      console.log("Directory already exists");     
      await octokit.issues.createComment({
        owner, 
        repo, 
        issue_number, 
        body: `@${author.login}, the project [${title}](${github.context.payload.repository.html_url}/tree/master/projects/${title.replace(/( )/g, "%20")}) already exits. If you wanted to update/add a playground to this project please do so via the link provided in the project README.`
      });
      await octokit.issues.update({
        owner, 
        repo, 
        issue_number, 
        title: `[project][duplicate] ${title}`, 
        state: "closed",
        labels: ["duplicate"]
      });
      await octokit.issues.lock({owner, repo, issue_number});

    }

  } catch (error) {
    console.log(error);
  }
}

function buildProjectYml(data) {
  try {
    const author = {
      id: github.context.payload.sender.id,
      login: github.context.payload.sender.login,
      date: getDateString(github.context.payload.issue.created_at)
    }
    const buildPlayground = name => playgrounds => ({
        flavour: Flavours[name],
        url: playgrounds && playgrounds[name] ? playgrounds[name] : null,
        author: playgrounds && playgrounds[name] ? author : null,
        contributor: null
    });
    return yaml.safeDump({
      issue: github.context.payload.issue.number,
      ios: data.ios,
      android: data.android,
      title: data.title,
      author: author,
      description: data.description,
      resources: data.resources,
      playgrounds: {
        js: buildPlayground("js")(data.playgrounds),
        ng: buildPlayground("ng")(data.playgrounds),
        tsc: buildPlayground("tsc")(data.playgrounds),
        vue: buildPlayground("vue")(data.playgrounds),
        react: buildPlayground("react")(data.playgrounds),
        svelte: buildPlayground("svelte")(data.playgrounds),
      }
    });
  } catch(e) {
    console.log(e);
  }
}
