# copy-async

复制文本、富文本到剪切板，[WebSite](https://bowencool.github.io/copy-async/)

# usage

```bash
npm i copy-text-or-rich-text-to-clipboard-async
```

```js{3-6}
import copy from 'copy-text-or-rich-text-to-clipboard-async';

await copy('hello world');
await copy('<h1>hello world</h1>');
await copy(document.querySelector('#rich-text'));
await copy(document.querySelector('#rich-text'), { html: true });
```
