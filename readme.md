# create-vitepress-demo

搭建一个带有专业 demo 演示能力的 vitepress 项目，查看[相关介绍](https://blog.bowen.cool/zh/posts/add-more-professional-demo-presentation-capabilities-to-vitepress)、[示例站点](https://bowencool.github.io/create-vitepress-demo/guide/contribution.html)

```bash
npm init vitepress-demo
# or
yarn create vitepress-demo
```

# 背景

vitepress 凭借着 vite 的秒级启动速度、markdown-it 的强大扩展能力、天然支持 vue3 在文档圈迅速流行开来，使用 vitepress 做 vue3 组件库文档也已经非常流行。笔者也有幸实践过一次，在这里记录一下。

首先 [vitepress 的 markdown 扩展能力](https://vitepress.vuejs.org/guide/markdown.html) 无疑是极香的，我觉得及其舒适的有以下几点：

- [Import Code Snippets](https://vitepress.vuejs.org/guide/markdown.html#import-code-snippets)
- [运行 vue 组件](https://vitepress.vuejs.org/guide/using-vue.html)

笔者使用 vitepress 搭建业务组件库的文档，依赖 element-plus，根据 vitepress 文档，写了一个简单的 DemoContainer 组件用于包裹 Demo。

## vitepress 缺点

随着时间的推移和组件数量的累积，现有的开发方式逐渐暴露出来一些问题：

1. 无法演示全屏组件(height:100vh)
2. 无法演示路由组件（耦合 vue-router，如 menu-item）
3. vitepress 有一些全局样式挺烦的，经常干扰到 Demo，比如：

```css
table {
  display: block;
  border-collapse: collapse;
  margin: 1rem 0;
  overflow-x: auto;
}
```

4. 引用 demo 太繁琐，而且易出错（引用一个 Demo 要 15 行代码）

```markdown
<script setup>
  // 这个 demo1 重复了多次，复制修改的时候容易漏掉
  import Demo1 from './demo/demo1.tsx'
</script>

<DemoContainer title="基本使用">
<ClientOnly>
<Demo1 />
</ClientOnly>
  <details>
    <summary>查看代码</summary>

<!-- 这个源码引用方式是 vitepress 提供的 -->

<<< packages/query-table/demo/demo1.tsx

  </details>
</DemoContainer>
```

前两点很容易想到用 iframe 是完美的解决方案，而且还能顺手解决第三点。

总结一下缺点有两个：

1. Demo 引用繁琐
2. 缺少 iframe 模式

# 前置介绍

### 涉及到的框架之间的关系

vitepress 本质上是一个 vite 插件，使用它开发的文档网站效果相当于 vue3 + vite 的 ssr 项目，它在内部帮你把所有逻辑都封装好了，你只需要写 markdown 就行。

对 markdown 的扩展能力是基于 markdown-it 写了很多 markdown-it 插件。源码里所写的 markdown 文档最终都会转成 vue 组件，原理如下：

### vitepress 运行 vue 组件原理

把 markdown 编译成 html 字符串，把 html 字符串拼凑成一个 vue 字符串，交给 vue-loader，处理成一个 vue 组件挂载到页面上。

# 调研

- dumi 效果完美，可以说是标杆了。但是不支持 vue
- storybook 并不是想要的 iframe 模式，也不行。
- vitepress-for-component 是 fork 了 vitepress（因为 vitepress 目前未支持插件），提供了 demo 演示能力，但是没有 iframe 模式。
- element-plus 也是用 vitepress , 但是也没有 iframe 模式。而且它的引用方式不清晰、不灵活。
- 自研，舍不得 vitepress 的 markdown 扩展能力。不到走投无路不要自研。

最终决定尝试通过修改配置和自定义插件解决。

# 研发

## demo 引入简化

参考了 [element-plus](https://github.com/element-plus/element-plus) 和 [vitepress-for-component](https://github.com/dewfall123/vitepress-for-component) ，定制一个 markdown-it 插件修改 html 编译结果。

### 引入方式设计

element-plus 的引入方式不够清晰，也不够灵活。采用相对路径更清晰更灵活：

```markdown
<demo src="./demo-example.vue" title="Demo演示" desc="这是一段描述" />
```

当然 container 的方式也顺便兼容下，里面的内容可以写写 markdown：

```markdown
::: demo src="./demo-example.vue" title="Demo 演示"

这是一段描述，可以用 `Markdown` 来写

:::
```

### 插件思路

遇到特定标记（如：`<demo src=xxx ... />`)，根据标记拼接字符串，将来会被插入到 vue template 里相应位置，通常情况下拼接 `<DemoContainer ... ><Demo/></DemoContainer>`，如果标记了以 iframe 模式运行 demo，则拼接一个`<iframe src=xxx ... />`

此过程还会包括如下步骤，感兴趣可以看[源码](https://github.com/bowencool/create-vitepress-demo)：

- 插入 import statement 语句
- 记录 demoId 和入口的对应关系

这一步把引入 Demo 的过程从原来的 15 行代码之间简化到 1 行。

## iframe 模式

### 运行时动态创建 iframe

试过在 DemoContainer 里 document.createElement('iframe')，但是没有成功：

- 获取到 slot 内容的时候，组件代码已经运行了，此时放入沙箱已经晚了。
- 获取到 demo 源代码交给 vue-compiler 编译这个**编译工作**在**运行时**做不现实。

### 微前端

这明显更复杂了，而且和动态 iframe 具有相同的问题。

### 在 vite 配置里直接加入口

第一个念头是 vite.config 里添加入口，因为 vite 就是支持多个 html 的。

实际操作之后发现[根本行不通](https://github.com/vuejs/vitepress/issues/57#issuecomment-973873527)：vitepress 接管路由了，访问任何路径都会经过 vitepress router 处理。即使设置 base，也会收到 vitepress 的提醒。

![image](https://user-images.githubusercontent.com/20217146/142593193-73c301b8-e1b4-4cb6-83a5-e6aba9ec3967.png)

查看源码得知，devServer 拦截了所有 html 请求，根据请求路径动态生成 html：

<details>
  <summary>查看代码 vitepress/src/node/plugin.ts</summary>

```ts
const vitePressPlugin: Plugin = {
  name: "vitepress",
  // ...
  configureServer(server) {
    if (configPath) {
      server.watcher.add(configPath);
    }

    // serve our index.html after vite history fallback
    return () => {
      server.middlewares.use((req, res, next) => {
        if (req.url!.endsWith(".html")) {
          res.statusCode = 200;
          res.end(`
<!DOCTYPE html>
<html>
  <head>
    <title></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/@fs/${APP_PATH}/index.js"></script>
  </body>
</html>`);
          return;
        }
        next();
      });
    };
  },
};
```

</details>

### 定制 devServer 中间件

上面 vitepress 的操作给了我灵感，我也写个 devServer 中间件，根据请求路径动态生成 html。试了一下，还真成功了，流程如下：

1. 上面提到定制的 markdown-it 修改 html 输出为 `<iframe src=xxx />`
2. 浏览器会向 devServer 请求 iframe 地址
3. devServer 中间件拿到这个请求，如果命中约定格式，比如 `/^\/~demos\/(?<demoId>\w+)\.html$`，则拼接一个可以运行此 demo 的 html 字符串给浏览器。
   1. 找到 demoId 对应的入口文件 demoEntry
   2. 写一些运行时 script 作为入口
      1. 通过入口地址从 vite 请求编译结果：`const module = await import('@fs/${demoEntry}')`
      2. 约定 module.default 导出自动挂载的组件。否则视为 demoEntry 自行挂载

![流程图](https://user-images.githubusercontent.com/20217146/147480565-2e3b7b64-e5a0-4cb4-ab61-a0a7700ce595.png)

<!--
```sequence
Browser->ViteDevServer: request: http://.../xxx.html
ViteDevServer->MarkdownIt: read: /xxx.md
Note over MarkdownIt: markdown-it-demo
MarkdownIt->demos.json: write: { Demo123: { entry: '/.../demo.vue' }, ... }
MarkdownIt->ViteDevServer: return: \n<!DOCTYPE html>\n...<iframe src="/~demos/Demo123.html" />...
ViteDevServer->Browser: response: \n<!DOCTYPE html>\n...<iframe src="/~demos/Demo123.html" />...
Browser->ViteDevServer: request: http://.../~demos/Demo123.html
Note over ViteDevServer: vite-plugin-demo-iframe\nmatched\n /^\/~demos\/(\w+)\.html/
ViteDevServer->demos.json: read: find Demo123.html's entry
demos.json->ViteDevServer: return: Demo123.html's entry is '/.../demo.vue'
Note over ViteDevServer: genHtml({ entry: '/.../demo.vue' }):\n<!DOCTYPE html>\n...demo...
ViteDevServer->Browser: response: \n<!DOCTYPE html>\n...demo...
```
-->

### 构建模式

由于构建模式没有 devServer，所以上述 devServer 也不会生效。

vitepress 和处理请求一样一刀切，没有留余地，无法通过 vite 添加入口。

所以只能在 `vitepress build` 之后再跑一遍 `vite build -c=xxx`

![流程图](https://user-images.githubusercontent.com/20217146/147480688-9bc9bbf0-d08e-47d5-a511-be401c04bfaa.png)

<!-- ```sequence
vitepress build->MarkdownIt: read: /xxx.md
Note over MarkdownIt: markdown-it-demo
MarkdownIt->demos.json: write: { Demo123: { entry: '/.../demo.vue' }, ... }
MarkdownIt->vitepress build: return: \n<!DOCTYPE html>\n...<iframe src="/~demos/Demo123.html" />...
Note over vitepress build: write dist/
vite build->demos.json: read: all demos
Note over vite build: add all demo entry
Note over vite build: write dist/~demos/
``` -->


# 总结

由于这套刚刚出炉，所以有很多的优化点，发出来权当抛砖引玉了。

因为 vitepress 暂时没有插件机制，所以这套方案也没什么抽象的点子，暂时作为一个样板仓库。

如果你有好的点子或者优化的地方，请联系我。
