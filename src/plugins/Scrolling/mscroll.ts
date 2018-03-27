import Vue from 'vue';
/* 移动端滑动优化 */

export interface WinInfo {
  scrollY: number;
  direction: number;
  gap: number;
}

let noopFunction = () => null;

function listener(this: MobileScroll) {
  if (!this.rafingMark) {
    this.startRaf();
  }
}

type CbType = (p: WinInfo) => void;

let passiveSupported: boolean = false;
try {
  var options = Object.defineProperty({}, 'passive', {
    get: function() {
      passiveSupported = true;
    },
  });

  window.addEventListener('test', noopFunction, options);
} catch (err) {}

class MobileScroll {
  nowY: number;
  lastY: number;
  direction: number;
  rafMark: number;
  rafingMark: boolean;
  gap: number;
  scrollList: Array<CbType>;
  scrollEndList: Array<CbType>;
  vm: Vue;
  listener: () => void;
  constructor(vm: Vue) {
    let sy = window.scrollY;
    this.scrollList = [];
    this.scrollEndList = [];
    this.nowY = sy;
    this.lastY = sy;
    this.direction = 0;
    this.rafMark = -1;
    this.rafingMark = false;
    this.gap = 0;
    this.vm = vm;
    this.listener = listener.bind(this);
  }
  /* 添加滚动监听事件 */
  onScroll(cb: CbType) {
    if (typeof cb === 'function') {
      this.scrollList.push(cb.bind(this.vm));
    }
  }
  /* 添加滚动结束事件 */
  onScrollEnd(cb: CbType) {
    if (typeof cb === 'function') {
      this.scrollEndList.push(cb.bind(this.vm));
    }
  }
  /* 滚动结束时会调用 */
  scrollEnd() {
    let winInfo: WinInfo = {
      scrollY: this.nowY,
      direction: this.direction,
      gap: Math.abs(this.gap),
    };
    for (let i = 0, j = this.scrollEndList.length; i < j; i++) {
      try {
        this.scrollEndList[i](winInfo);
      } catch (e) {
        console.warn(e);
      }
    }
    this.endRaf();
  }
  /* 正在滚动时会调用 */
  scrolling() {
    this.nowY = this.vm.$el.scrollTop;
    this.gap = this.nowY - this.lastY;
    if (this.gap) {
      //正在滑动，1为向上滑动，-1为向下滑动
      this.direction = ((+(this.gap > 0) | 0) - 0.5) * 2;
      this.lastY = this.nowY;
      let winInfo: WinInfo = {
        scrollY: this.nowY,
        direction: this.direction,
        gap: this.gap,
      };
      for (let i = 0, j = this.scrollList.length; i < j; i++) {
        try {
          this.scrollList[i](winInfo);
        } catch (e) {
          console.warn(e);
        }
      }
      this.startRaf();
    } else {
      this.scrollEnd();
    }
  }
  /* 开启raf */
  startRaf() {
    this.rafMark = window.requestAnimationFrame(this.scrolling.bind(this));
    this.rafingMark = true;
  }
  /* 结束raf */
  endRaf() {
    window.cancelAnimationFrame(this.rafMark);
    this.rafingMark = false;
  }
  /* 监听window滚动事件 */
  bindEvent() {
    let options = passiveSupported ? { passive: true } : false;
    let el = this.vm.$el;
    if (el) {
      el.addEventListener('scroll', this.listener, options);
    }
  }
  unbindEvent() {
    let el = this.vm.$el;
    if (el) {
      el.removeEventListener('scroll', this.listener);
    }
  }
}

export default MobileScroll;
