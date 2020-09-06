const fs = require("fs");
const yaml = require("js-yaml");
const github = require("@actions/github");

(async function(){
  try { 
    const setProjectAction = project => action => type => {
      const title = project.replace(/( )/g, "+");
      const repo = github.context.payload.repository.html_url;
      return `[${action}](${repo}/issues/new/?title=[${action}][${type}]%20${title}&body=%3C%21%2D%2D+Just+past+your+playground+link+below+and+press+Submit+%2D%2D%3E)`
    };

    const userOnDate = user => {
      const usercontent = "https://avatars3.githubusercontent.com/u";
      const avatar = `${usercontent}/${user.id}?s=60&v=4`;
      const img = `<img src="${avatar}" width="21" align="center"/>`;
      return `[${img} @${user.login}](https://github.com/${user.login}) on _${user.date}_.`;
    };

    const directory = process.env.TITLE;
    const file = await fs.promises.readFile("projects/${directory}/data.yaml");
    const template = await fs.promises.readFile(
      "./.github/action/TEMPLATE.md",
      { encoding: "utf-8", flag: "r" }
    );
    const data = yaml.safeLoad(file);
    
    
    console.log(data);
  
    const readme = template.replace(/\{\{(?:[a-z]|\.)+\}\}/g, match => {
      switch (match) {
        case "{{ios}}":
          return data.ios ? "![ios-badge]" : "";
        case "{{android}}":
          return data.android ? "![android-badge]" : "";
        case "{{title}}":
          return data.title
        case "{{description}}":
          return data.description;
        case "{{resources}}":
          return data.resources;
        default:
          // match must be of 'playground.flavour?action/author/contributor'
          const index = match.indexOf(".");
          const lastIndex = match.lastIndexOf(".");
          const flavour = match.substring(index + 1, lastIndex);
          const playground = data.playgrounds[flavour];

          switch (match) {
            case `{{playground.${flavour}.action}}`:
              const action = playground.url ? "update" : "add";
              const type = playground.flavour.toLowerCase();
              return setProjectAction(data.title)(action)(type);
            case `{{playground.${flavour}.url}}`:
              return playground.url 
                ? `${playground.url}` 
                : `This project has no _${playground.flavour}_ playground.`
            case `{{playground.${flavour}.author}}`:
              return playground.author
                ? `- Authored by ${userOnDate(playground.author)}`
                : "";
            case `{{playground.${flavour}.contributor}}`:
              return playground.contributor 
                ? `- Last contribution by ${userOnDate(playground.contributor)}` 
                : "";
          }
      }
    });

    await fs.promises.writeFile(`projects/Test 17/README.md`, readme); 
  } catch (error) {
    console.log(error);
  }
})();