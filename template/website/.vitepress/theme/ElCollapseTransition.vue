<template>
  <transition v-on="on">
    <slot></slot>
  </transition>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  // import { addClass, removeClass } from '@element-plus/utils/dom'

  const trimArr = function (s: string) {
    return (s || '').split(' ').filter((item) => !!item.trim());
  };

  function addClass(el: HTMLElement | Element, cls: string): void {
    if (!el) return;
    let className = el.getAttribute('class') || '';
    const curClass = trimArr(className);
    const classes = (cls || '').split(' ').filter((item) => !curClass.includes(item) && !!item.trim());

    if (el.classList) {
      el.classList.add(...classes);
    } else {
      className += ` ${classes.join(' ')}`;
      el.setAttribute('class', className);
    }
  }

  function removeClass(el: HTMLElement | Element, cls: string): void {
    if (!el || !cls) return;
    const classes = trimArr(cls);
    let curClass = el.getAttribute('class') || '';

    if (el.classList) {
      el.classList.remove(...classes);
      return;
    }
    classes.forEach((item) => {
      curClass = curClass.replace(` ${item} `, ' ');
    });
    const className = trimArr(curClass).join(' ');
    el.setAttribute('class', className);
  }

  export default defineComponent({
    name: 'ElCollapseTransition',
    setup() {
      return {
        on: {
          beforeEnter(el: HTMLElement) {
            addClass(el, 'collapse-transition');
            // if (!el.dataset) el.dataset = {};

            el.dataset.oldPaddingTop = el.style.paddingTop;
            el.dataset.oldPaddingBottom = el.style.paddingBottom;

            el.style.height = '0';
            el.style.paddingTop = '0';
            el.style.paddingBottom = '0';
          },

          enter(el: HTMLElement) {
            el.dataset.oldOverflow = el.style.overflow;
            if (el.scrollHeight !== 0) {
              el.style.height = `${el.scrollHeight}px`;
              if (el.dataset.oldPaddingTop) el.style.paddingTop = el.dataset.oldPaddingTop;
              if (el.dataset.oldPaddingBottom) el.style.paddingBottom = el.dataset.oldPaddingBottom;
            } else {
              el.style.height = '';
              if (el.dataset.oldPaddingTop) el.style.paddingTop = el.dataset.oldPaddingTop;
              if (el.dataset.oldPaddingBottom) el.style.paddingBottom = el.dataset.oldPaddingBottom;
            }

            el.style.overflow = 'hidden';
          },

          afterEnter(el: HTMLElement) {
            // for safari: remove class then reset height is necessary
            removeClass(el, 'collapse-transition');
            el.style.height = '';
            if (el.dataset.oldOverflow) el.style.overflow = el.dataset.oldOverflow;
          },

          beforeLeave(el: HTMLElement) {
            // if (!el.dataset) el.dataset = {};
            el.dataset.oldPaddingTop = el.style.paddingTop;
            el.dataset.oldPaddingBottom = el.style.paddingBottom;
            el.dataset.oldOverflow = el.style.overflow;

            el.style.height = `${el.scrollHeight}px`;
            el.style.overflow = 'hidden';
          },

          leave(el: HTMLElement) {
            if (el.scrollHeight !== 0) {
              // for safari: add class after set height, or it will jump to zero height suddenly, weired
              addClass(el, 'collapse-transition');
              // fix #968 collapse animation failure.
              // in vue3.0.4, transitionProperty is set 'none' to avoid 'v-leave-from' issue
              el.style.transitionProperty = 'height';
              el.style.height = '0';
              el.style.paddingTop = '0';
              el.style.paddingBottom = '0';
            }
          },

          afterLeave(el: HTMLElement) {
            removeClass(el, 'collapse-transition');
            el.style.height = '';
            if (el.dataset.oldOverflow) el.style.overflow = el.dataset.oldOverflow;
            if (el.dataset.oldPaddingTop) el.style.paddingTop = el.dataset.oldPaddingTop;
            if (el.dataset.oldPaddingBottom) el.style.paddingBottom = el.dataset.oldPaddingBottom;
          },
        },
      };
    },
  });
</script>
