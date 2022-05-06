(function () {
  const Selectors = Object.freeze({
    RESULT: '#search a[data-ved]',
    PREV_PAGE: 'a#pnprev',
    NEXT_PAGE: 'a#pnnext',
  });

  const Colors = Object.freeze({
    DEFAULT: 'inherit',
    FOCUSED: '#FFCCCC',
  });

  const Directions = Object.freeze({
    FORWARD: 'j',
    BACKWARD: 'k',
  });

  const StoreKeys = Object.freeze({
    DIRECTION: 'dowsing.direction',
  });

  class Navigator {
    #results = [];
    #prevPage = null;
    #nextPage = null;
    #cursor = 0;

    constructor(nargs) {
      this.#results = nargs.results;
      this.#prevPage = nargs.prevPage;
      this.#nextPage = nargs.nextPage;
      this.#cursor = 0;
    }

    get prevPageHref() {
      const node = this.#prevPage;
      if (!node) {
        return null;
      }
      return node.href;
    }

    get nextPageHref() {
      const node = this.#nextPage;
      if (!node) {
        return null;
      }
      return node.href;
    }

    get currentHref() {
      const node = this.#results[this.#cursor];
      if (!node) {
        return null;
      }
      return node.href;
    }

    focusFirstNode() {
      this.#cursor = 0;
      return this._moveFocus(0);
    }

    focusLastNode() {
      this.#cursor = this.#results.length - 1;
      return this._moveFocus(0);
    }

    get hasNextNode() {
      return this.#cursor < this.#results.length - 1;
    }

    focusNextNode() {
      return this._moveFocus(+1);
    }

    get hasPreNode() {
      return this.#cursor > 0;
    }

    focusPrevNode() {
      return this._moveFocus(-1);
    }

    _moveFocus(delta) {
      const oldCursor = this.#cursor;
      const newCursor = oldCursor + delta;

      if (newCursor < 0 || this.#results.length - 1 < newCursor) {
        return false;
      }

      if (newCursor != oldCursor) {
        const oldNode = this.#results[oldCursor];
        oldNode.style.backgroundColor = Colors.DEFAULT;
      }

      const newNode = this.#results[newCursor];
      newNode.style.backgroundColor = Colors.FOCUSED;
      newNode.focus();

      this.#cursor = newCursor;
      return true;
    }
  }

  const nav = new Navigator({
    results: document.querySelectorAll(Selectors.RESULT),
    prevPage: document.querySelector(Selectors.PREV_PAGE),
    nextPage: document.querySelector(Selectors.NEXT_PAGE),
  });

  key('⌘+return', (ev) => {
    const href = nav.currentHref;
    if (href) {
      window.open(href);
      ev.stopPropagation();
      ev.preventDefault();
    }
  });
  key('return', (ev) => {
    const href = nav.currentHref;
    if (href) {
      window.location.href = href;
      ev.stopPropagation();
      ev.preventDefault();
    }
  });
  key('j', (ev) => {
    if (nav.hasNextNode) {
      nav.focusNextNode();
      ev.stopPropagation();
      return;
    }

    const href = nav.nextPageHref;
    if (href) {
      localStorage.setItem(StoreKeys.DIRECTION, Directions.FORWARD);
      window.location.href = href;
      ev.stopPropagation();
    }
  });
  key('k', (ev) => {
    if (nav.hasPreNode) {
      nav.focusPrevNode();
      ev.stopPropagation();
      return;
    }

    const href = nav.prevPageHref;
    if (href) {
      localStorage.setItem(StoreKeys.DIRECTION, Directions.BACKWARD);
      window.location.href = href;
      ev.stopPropagation();
    }
  });

  const dir = localStorage.getItem(StoreKeys.DIRECTION);

  localStorage.removeItem(StoreKeys.DIRECTION);

  switch (dir) {
    case Directions.FORWARD:
      nav.focusFirstNode();
      break;
    case Directions.BACKWARD:
      nav.focusLastNode();
      break;
    default:
      nav.focusFirstNode();
      break;
  }
})();
