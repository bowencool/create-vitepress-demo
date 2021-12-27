const renderDir = require('./renderDir');
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const argv = require('minimist')(process.argv.slice(2));
const execAsync = require('./execAsync');

async function main() {
  let projectName = argv?._?.[0];
  if (!projectName || typeof projectName !== 'string') {
    const ans = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: '目录名',
      },
    ]);
    projectName = ans.projectName;
  }
  const targetDir = path.resolve(process.cwd(), projectName);
  if (fs.existsSync(targetDir)) {
    throw new Error('目录已存在');
  }
  console.log(__dirname, 'rendering...');
  // await execAsync("rm -rf .init-tmp");
  // await execAsync("mkdir .init-tmp");
  // renderDir()
  await renderDir(
    // `${process.cwd()}/.init-tmp`,
    __dirname,
    'template',
    `${process.cwd()}/${projectName}`,
    {
      prompts: [
        {
          type: 'string',
          name: 'name',
          default: projectName,
          required: true,
          message: '名称',
          validate(v) {
            if (/^[a-z][A-z0-9-]*$/.test(v)) {
              return true;
            }
            return '输入不合法';
          },
        },
        {
          type: 'string',
          name: 'description',
          default: 'description',
          message: '描述',
        },
      ],
      done() {
        await execAsync(`ln -s ../CHANGELOG.md changelog.md`, `${targetDir}/website`);
      },
    },
  );
}

main();
