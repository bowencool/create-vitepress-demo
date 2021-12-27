import DefaultTheme from 'vitepress/theme';
import DemoContainer from './DemoContainer.vue';
import './custom.scss';

export default {
  ...DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    app.component('DemoContainer', DemoContainer);
  },
};
