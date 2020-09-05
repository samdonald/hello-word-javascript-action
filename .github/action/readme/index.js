const fs = require("fs");
const yaml = require("js-yaml");
const core = require("@actions/core");

(async function(){
  try { 
    const setProjectAction = project => action => type => {
      const title = project.replace(/( )/g, "+");
      return `[${action}](https://github.com/mudlabs/hello-word=javascript-action/issues/new/?title=[${action}][${type}]%20${title}&body=%3C%21%2D%2D+Just+past+your+playground+link+below+and+press+Submit+%2D%2D%3E)`
    };

    const projectDirectory = "Test 17"; // need to get this from variable
    const data = yaml.safeLoad(`projects/${projectDirectory}/data.yaml`);
    const template = await fs.promises.readFile(
      "./.github/action/TEMPLATE.md",
      { encoding: "utf-8", flag: "r" }
    );
    console.log(data);
  
    const readme = template.replace(/\{\{(?:[a-z]|\.)+\}\}/g, match => {
      switch (match) {
        case "{{ios}}":
          return data.ios ? "![iOS]" : "";
        case "{{android}}":
          return data.android ? "![Android]" : "";
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
          let login, url, date;

          switch (match) {
            case `{{playground.${flavour}.action}}`:
              const action = playground.url ? "update" : "add";
              const type = playground.flavour.toLowerCase();
              return setProjectAction(data.title)(action)(type);
            case `{{playground.${flavour}.url}}`:
              return playground.url 
                ? `> ${playground.url}` 
                : `> This project has no _${playground.flavour}_ playground.`
            case `{{playground.${flavour}.author}}`:
              login = playground.author.login;
              url = `https://github.com/${login}`;
              date = playground.author.date;
              return playground.author 
                ? `> - Authored by [@${login}](${url}) on _${date}_.` 
                : "";
            case `{{playground.${flavour}.contributor}}`:
              login = playground.contributor.login;
              url = `https://github.com/${login}`;
              date = playground.contributor.date;
              return playground.contributor 
                ? `> - Last contribution by [@${login}](${url}) on _${date}_.` 
                : "";
          }
      }
    });

    await fs.promises.writeFile(`projects/${data.title}/README.md`, readme); 
  } catch (error) {
    console.log(error);
  }
})();