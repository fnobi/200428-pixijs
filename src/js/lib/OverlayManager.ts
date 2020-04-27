export default class OverlayManager {
  private base: HTMLElement;

  private y = 0;

  public constructor(base: HTMLElement) {
    this.base = base;
  }

  public pin() {
    const el = document.scrollingElement;
    if (!el) {
      return;
    }
    this.y = el.scrollTop;
    this.base.setAttribute("data-overlay", "true");
    this.base.style.top = `${-this.y}px`;
  }

  public unpin() {
    const el = document.scrollingElement;
    if (!el) {
      return;
    }
    this.base.setAttribute("data-overlay", "false");
    this.base.style.top = "";
    el.scrollTo(0, this.y);
  }
}
