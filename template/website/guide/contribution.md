## 目录说明

```
    packages
    ├── .xx-xx // 约定含有'.'的被忽略
    ├── xx-xx
    │   ├── readme.md // 文档入口
    │   └──
    ├──- ...
    └─── index.ts // 出口
```

## 技术栈说明

- 开发时启动的是 [vitepress](https://vitepress.vuejs.org/guide/markdown.html)，并定制了 markdown 插件，查看[下文](#编写文档)。
- 支持 [tsx](https://github.com/vuejs/jsx-next/blob/dev/packages/babel-plugin-jsx/README-zh_CN.md)。
- 单测使用 [jest](https://jestjs.io/zh-Hans/docs/getting-started) 和 [@vue/test-utils](https://next.vue-test-utils.vuejs.org/guide/) 。

## 命名规范

- 组件名 PascalCase
- 目录/文件名 kebab-case
- 方法/变量名（包括 CSS Module 类名） camelCase
- 常量/枚举名 SNAKE_CASE

## 一般步骤

- 边写测试用例边开发，原则上没有测试用例的不合并，除非 demo 覆盖较全
- 发布测试版，验证后再提 MR 发布正式版

## 编写文档

除了 [vitepress](https://vitepress.vuejs.org/guide/markdown.html) 提供的 markdown 能力，本项目补充了 **Demo 演示能力**。

### demo 可用的 Props

| 名称 | 类型 | 是否必传 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| src | string | yes | - | demo 文件 |
| title | string | no | `"基本使用"` | 标题 |
| desc | string | no | - | 描述，支持 markdown |
| compact | boolean | no | - | 移除内边距 |
| iframe | boolean | no | `src.endsWith('.html')` | 以 iframe 模式运行 |
| iframeHeight | string | no | (自动计算) | iframe['height'] |
| file | string | no | - | 类似于 src，额外显示的代码，可以重复传值，例如：<br> `file="./a.ts" file="./b.ts"` |

### 方式一

<demo src="./demo.vue" />

```markdown
<demo src="./demo.vue" />
```

<demo
  src="./demo.vue"
  file="./intro.md"
  file="../index.md"
  title="我是一个可选的标题"
  compact
  desc="我是一段可选的描述，我可以用 `Markdown` 编写。"
/>

```markdown
<demo
  src="./demo.vue"
  file="./intro.md"
  file="../index.md"
  title="我是一个可选的标题"
  compact
  desc="我是一段可选的描述，我可以用 `Markdown` 编写。"
/>
```

<demo
  src="./demo.vue"
  title="iframe 模式"
  iframe
  iframeHeight="50"
/>

```markdown
<demo src="./demo.vue" title="iframe 模式" iframe iframeHeight="50" />
```

### 方式二

::: demo src="./demo.vue" title="Demo 标题"

我是一段描述，我可以用 `Markdown` 编写。

我是真正的 `Markdown` ，有 `IDE` 提示。

:::

```markdown
::: demo src="./demo.vue" title="Demo 标题"

我是一段描述，我可以用 `Markdown` 编写。

我是真正的 `Markdown` ，有 `IDE` 提示。

:::
```

## 分支

新功能从主分支切出去，合并到 dev 测试。测试完提 MR 给仓库维护者。

## 发布

::: warning

由于 changelog 是从 git commit message 里提取出来的，所以请严格遵守 commitlint 。 [详情](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/README.md#examples)

:::

基本技巧：

```bash
# 自动增加版本号
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease [--preid=<prerelease-id>] | from-git]
# 发布到指定tag，默认 latest
npm publish [--tag <tag>]
# 安装指定tag，默认 latest
npm i xx@alpha
```

关于版本号管理： https://docs.npmjs.com/about-semantic-versioning#incrementing-semantic-versions-in-published-packages

### 发布测试版

指定一个`npm tag`，以 `alpha` 为例：

```bash{2,3}
# git commit -am "feat: balabala"
npm version prerelease --preid=alpha
npm publish --tag=alpha
# git push
```

推荐合并到 dev 分支，统一发布测试版，以避免冲突。

### 发布正式版

提 `Merge Request` 给仓库维护者。

## 注意事项

### 样式

- `Scoped Style` 基本废了：虽然打包出来是正确的，但到项目中运行时就会丢掉 `scopeId`。
- 推荐使用 [CSS Module](http://www.ruanyifeng.com/blog/2016/06/css_modules.html) :
