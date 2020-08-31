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
  const exp = new RegExp(/(play.nativescript.org\/\?template\=play-(?:js|tsc|ng|react|vue|svelte)\&id\=(?:\w)+\&v\=(?:\d)+)|[^]/, g);
  const playgrounds = section.split(" ")
    .filter(playground => playground.includes(url))
    .map(url => url.replace(exp, "$1"));

  if (playgrounds.length < 1) return null;
  
  return playgrounds.reduce((obj, item) => {
    if (item.includes("play-js")) {
      obj["JavaScript"] = item;
    } else if(item.includes("play-tsc")) {
      obj["TypeScript"] = item;
    } else if (item.includes("play-ng")) {
      obj["Angular"] = item;
    } else if (item.includes("play-vue")) {
      obj["Vue"] = item;
    } else if (item.includes("play-react")) {
      obj["React"] = item;
    } else if (item.includes("play-svelte")) {
      obj["Svelte"] = item;
    }
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

    if (!fs.existsSync(`${title}`)) {
      const description = extractDescription(body);
      const resources = extractResources(body);
      const ios = extractPlatformSupport(body)("ios");
      const android = extractPlatformSupport(body)("android");
      const playgrounds = extractPlaygrounds(body);
      
      // all minimum requirements in place
      if (title && description && playgrounds && (ios + android)) {
        const data = 
        `
        [JavaScript]: https://img.shields.io/badge/JavaScript-%E2%9C%93-F7DF1E.svg?logo=JavaScript&logoColor=F7DF1E&labelColor=000000
        
        [Playground (JavaScript)]: ${playgrounds.JavaScript}
        
        ## ${title}

        ### Description
        ${description}

        ### Related Resources
        ${resources}

        ### Playgrounds
        | [Playground (JavaScript)] |
        | --- |
        | [![JavaScript]][Playground (JavaScript)] |
        `;

        const directory = await fs.promises.mkdir(`${title}`);
        const file = await fs.promises.writeFile(`${title}/README.md`, data);
        await octokit.issues.update({
          owner,
          repo,
          issue_number,
          title: "[project] ${title}",
        })
      }
    } else {
      console.log("Directory already exists");
    }

    

    

    // Build file
    if (!fs.existsSync(`${title}`)) {
      const data = `## ${title}\r\n\n## Description\r\n${description}\r\n\n## Related Resources\r\n${resources}`;
      const dir = await fs.promises.mkdir(`${title}`);
      const file = await fs.promises.writeFile(`${title}/README.md`, data);
    } else {
      console.log("Directory [${title}] already exists.");
    }
  } catch (error) {
    console.log(error);
  }
}




//   switch (github.context.action) {
//     case "opened":
//       const body = utils.stripComments(github.context.payload.issue.body);
//       console.log("BODY", body);
//       const title = extractTitle(body);
//       console.log("TITLE", title);
//       if (!fs.existsSync(`${title}`)) {
//         fs.mkdir(`./${title}`, e => {
//           if (e) {
//             console.log(e);
//           } else {
//             fs.writeFile(`./${title}/README.md`, `## ${title}`, e => {
//               if (e) {
//                 console.log(e);
//               } else {
//                 console.log("Directory and File saved.");
//               }
//             })
//           }
//         })
//       } else {
//         console.log("Directory Exists!");
//       }
//       break;
//     case "created":
//       console.log("CREATED");
//       break;
//   }



// const createComment = (body) => octokit.issues.createComment({
//   owner,
//   repo,
//   issue_number,
//   body
// });

// const findSection = text => sectionTitle => endOfSection => {
//   const start = text.indexOf(sectionTitle) + sectionTitle.length;
//   if (endOfSection === "") {
//     return text.substring(start).trim();
//   } else {
//     return text.substring(start, text.indexOf(endOfSection)).trim();
//   }
// };

// function parseTitle(body) {
//   const title = findSection(body)("## Project Title")("## Platform Support");
//   if (title.match(/^[a-z0-9 ]+$/i)) {
//     return utils.capitalise(title);
//   }
//   throw new Error("title");
// }

// const body = utils.stripComments(github.context.payload.issue.body);
// const title = parseTitle(body);

// if(!fs.existsSync(`${title}`)) {
//   fs.mkdir(`./${title}`, e => {
//     if (e) {
//       console.log(e);
//       return e;
//     } else {
//       fs.writeFile(`./${title}/README.md`, `## ${title}`, e => {
//         if (e) {
//           console.log(e);
//           return e
//         } else {
//           console.log("Directory and File saved.");
//           octokit.issues.update({
//             owner: github.context.payload.repository.owner.login,
//             repo: github.context.payload.repository.name,
//             issue_number: github.context.payload.issue.number,
//             title: `${title}`,
//             state: "closed"
//           });
//         }
//       })
//     }
//   })
// } else {
//   console.log("Project already exists")
//   return;
// }

// function parseDescription(body) {
//   const description = findSection(body)("## Description")("## Resources");

//   if (description !== "") {
//     return description;
//   }

//   throw new Error("description");
// }

// function parseResources(body) {
//   const resources = findSection(body)("## Resources")("## Playgrounds");
//   if (resources !== "") {
//     return resources;
//   }
//   throw new Error("resources");
// }

// function parsePlaygrounds(body) {
//   const playgrounds = findSection(body)("## Playgrounds")("");
//   if (playgrounds) {
//     return playgrounds;
//   }
//   throw new Error("playgrounds");
// }

// async function parseComment() {
//   try {
//     // const file = ;
//     // get working issue from metadata from file
//     // if sender is same as issue creator pay attention, else don't.
//     if (github.context.payload.sender.login !== File.issue.contributor) {
//       throw new Error("Invalid Contributor");
//     } else {
//       console.log("Comment to parse")
//       // 1. identify if a comment from the contributor was requested
//       // 1.1. does this comment follow the requested comment.
//       // 2. id what type of content to look for.
//       // 3. parse comment for content
//       // 4. update project content if found or reply to contributor that the information could not be found.
//     }
//   } catch (error) {
//     console.log(error.message)
//   }
// }

// try {
//   const contributor = github.context.payload.sender.login;

//   switch (github.context.action) {
//     case "opened":
//       projectSubmitted();
//       break;
//     case "created":
//       parseComment();
//       break;
//   }

//   async function projectSubmitted() {
//     try {
//       const body = utils.stripComments(github.context.payload.issue.body);
//       const title = parseTitle(body);

//       if (!fs.existsSync(`${title}`)) {
//         console.log("File does not exist.")
//         fs.mkdir(`${title}`, err => {
//           if (err) {
//             console.log(err);
//             return err
//           } else {
//             fs.writeFile(`./${title}/README.md`, `## ${title}`, err => {
//               if (err) {
//                 console.log(err);
//                 return err;
//               } else {
//                 console.log("Directory and file saved.");
//                 return;
//               }
//             });
//           }
//         });
//       } else {
//         console.log(`File (${title}) exists.`)
//       }
//       // const description = parseDescription(body);
//       // const resources = parseResources(body);
//       // const playgrounds = parsePlaygrounds(body);
//       // const ios = utils.platformSupport(body)("ios");
//       // const android = utils.platformSupport(body)("android");
      
//       // core.setOutput("title", title);
//       // core.setOutput("description", description);
//       // core.setOutput("resources", resources);
//       // core.setOutput("javascript", playgrounds.javascript);
//       // core.setOutput("typescript", playgrounds.typescript);
//       // core.setOutput("angular", playgrounds.angular);
//       // core.setOutput("vue", playgrounds.vue);
//       // core.setOutput("react", playgrounds.react);
//       // core.setOutput("svelte", playgrounds.svelte);
//       // core.setOutput("ios", ios)
//       // core.setOutput("android", android);

//       // if (!(ios + android)) {
//       //   throw new Error("platform");
//       // }
      
//     } catch (error) {
//       switch (error.message) {
//         case "title":
//           await createComment(
//             `@${contributor} I could not parse your title. Please reply with a short descriptive alphanumeric title.`
//           );
//           break;
//         case "description":
//           break;
//         case "resources":
//           break;
//         case "playground":
//           break;
//         case "platform":
//           await createComment(
//             `@${contributor} It looks like you have not indicated what platforms your project supports.\r\rDoes your project support ***iOS***?\r\r*(Please reply **Yes** or **No**)*`
//           );
//           break;
//       }
//     }
//   };

// } catch (error) {
//   console.log(error.message);
// }
