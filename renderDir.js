// const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const Handlebars = require('handlebars');
const ejs = require('ejs');
const Metalsmith = require('metalsmith');
const match = require('minimatch');
const chalk = require('chalk');
/**
 * Evaluate an expression in meta.json in the context of
 * prompt answers data.
 */
function evaluate(exp, data) {
  /* eslint-disable no-new-func */
  const fn = new Function('data', `with (data) { return ${exp}}`);
  try {
    return fn(data);
  } catch (e) {
    console.error(chalk.red(`Error when evaluating filter condition: ${exp}`));
  }
}

module.exports = function renderDir(workingDir, sourceDir, destDir, meta, defaultValues) {
  let _resolve;
  let _reject;
  const ans = {};
  const defered = new Promise((resolve, reject) => {
    _reject = reject;
    _resolve = resolve;
  });

  Metalsmith(workingDir)
    .source(sourceDir)
    .destination(destDir)
    .clean(true)
    .use(askQuestions)
    .use(filterFiles)
    .use(compileFiles)
    .build(build);

  return defered;

  async function build(err) {
    if (err) {
      _reject(err);
      return;
    }
    const rez = {
      // sourceDir: path.resolve(workingDir, sourceDir),
      destDir: path.resolve(workingDir, destDir),
      ans,
    };
    if (typeof meta.done === 'function') {
      await meta.done(rez);
    }
    _resolve(rez);
  }

  async function askQuestions(files, metalsmith, done) {
    if (defaultValues) {
      meta.prompts.forEach(q => {
        if (defaultValues[q.name] !== undefined) {
          q.default = defaultValues[q.name];
        }
      });
    }
    // const metadata = metalsmith.metadata();
    Object.assign(ans, await inquirer.prompt(meta.prompts));
    done();
  }

  function filterFiles(files, metalsmith, done) {
    const { filters } = meta;
    if (!filters) {
      return done();
    }
    // const metadata = metalsmith.metadata();

    const fileNames = Object.keys(files);
    Object.keys(filters).forEach(glob => {
      fileNames.forEach(file => {
        // const glob = pattern + '.bhs'
        const condition = filters[glob];
        const matched = match(file, glob, { dot: true })
          || match(file, `${glob}.hbs`, { dot: true })
          || match(file, `${glob}.ejs`, { dot: true });
        // if (file.endsWith('.hbs')) {}
        // console.log(glob, file, matched);
        if (matched) {
          const rez = evaluate(condition, ans);
          // console.log(ans, chalk.blue(condition, rez))
          if (!rez) {
            // console.log(chalk.red('delete', file))
            delete files[file];
          }
        }
      });
    });
    done();
  }
  function compileFiles(files, metalsmith, done) {
    // const metadata = metalsmith.metadata();
    Object.keys(files).forEach(fileName => {
      if (fileName.endsWith('.hbs')) {
        const file = files[fileName];
        delete files[fileName];
        file.contents = Handlebars.compile(file.contents.toString())(ans);
        files[fileName.slice(0, -4)] = file;
      } else if (fileName.endsWith('.ejs')) {
        const file = files[fileName];
        delete files[fileName];
        file.contents = ejs.render(file.contents.toString(), ans);
        files[fileName.slice(0, -4)] = file;
      }
    });
    done();
  }
};
