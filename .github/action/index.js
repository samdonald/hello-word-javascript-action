// const core = require("@actions/core");
// const github = require("@actions/github");
const fs = require("fs");

fs.access("project.md", (e) => {
  console.log("accessFile:", e)
  fs.writeFile("project.md", "## Project Title\r\nMy Title\r\n## Platform Support", e => {
    console.log("writeFile:", e)
  })
})

// const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
// const owner = github.context.payload.repository.owner.login;
// const issue_number = github.context.payload.issue.number;
// const repo = github.context.payload.repository.name;

// async function parseComment() {
//   try {
//     // const file = ;
//     // get working issue from metadata from file
//     // if sender is same as issue creator pay attention, else don't.
//     if (github.context.payload.sender.login !== File.issue.contributor) {
//       throw new Error("Invalid Contributor");
//     } else {
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
//   const body = github.context.payload.issue.body;

//   const createComment = (body) => octokit.issues.createComment({
//     owner,
//     repo,
//     issue_number,
//     body
//   });

//   function parseTitle(body) {
//     const projectTitle = "## Project Title";
//     const titleIndex = body.indexOf(projectTitle) + projectTitle.length;
//     const platformsIndex = body.indexOf("## Platform Support");
//     const title = body.substring(titleIndex, platformsIndex).trim();
    
//     if (title.match(/^[a-z0-9 ]+$/i)) {
//       return title;
//     }

//     throw new Error("Invalid Title");
//   }

//   switch (github.context.action) {
//     case "opened":
//       buildProject(body);
//       break;
//     case "created":
//       parseComment();
//       break;
//   }

//   (async function buildProject(body) {
//     try {
//       const filePath = "./projects.md";
//       fs.accessSync(filePath, fs.constants.O_RDWR);
//       fs.writeFileSync(filePath, "## Project Title\r\nMy Title :smile:")
//       // determin what event triggered the action
//       const title = parseTitle(body);
//       // const ios = parseIos(body);
//       // const android = parseAndroid(body);
//       // const description = parseDescription(body);
//       // const resources = parseResources(body);
//       // const playgrounds = parsePlaygrounds(body);

//       // if (ios == false && android == false) {
//       //   // request platform support status
//       // }
      
//       await octokit.issues.lock({owner,repo,issue_number});
//     } catch (error) {
//       switch (error.message) {
//         case "Invalid Title":
//           await createComment(
//             `@${contributor} I could not parse your title. Please reply with a short descriptive alphanumeric title.`
//           );
//           break;
//         case "No Support":
//           await createComment(
//             `@${contributor} It looks like you have not indicated what platforms your project supports.\r\r Does your project support ***iOS***?\r\r*(Please reply **Yes** or **No**)*`
//           )
//         default:
//           break;
//       }
//     }
//   })(body);

// } catch (error) {
//   console.log(error.message);
// }
