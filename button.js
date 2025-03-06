/* eslint-env browser */

import { getHtml } from './html.js';
import { config } from './config.js';

const buttonSize = config.buttonSize;
const iconWidth = config.iconWidth;
const offset = config.offset;
const widgetSpace = config.widgetSpace;
const minWidth = config.minChatWidth;
const topOffset = config.topOffset;
const defaultWidth = config.defaultChatWidth;


class ChatWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isDragging = false;
    this.isOpen = false;
    this.wasOpenBeforeDrag = false;
    this.isDrawer = config.isDrawer;
    this.size = {
      width: defaultWidth,
      height: this.isDrawer
        ? topOffset
          ? `calc(100% - ${topOffset})`
          : '100%'
        : `calc(100% - ${buttonSize.height} - ${offset} - ${topOffset ? topOffset : offset} - ${widgetSpace})`,
    };
    this.position = config.defaultPosition;
    this.boundEventListeners = new Map();

    window.addEventListener('message', (event) => {
      if (event.origin !== 'http://localhost:5173') {
        return;
      }
      const { data } = event;
      if (data.type === 'minimize') {
        this.toggleChat();
      }
    });
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.updatePositions.bind(this));

    this.boundEventListeners.forEach((listener, element) => {
      element.removeEventListener(listener.type, listener.fn);
    });

    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
    this.enableButtonDragging();
    window.addEventListener('resize', this.updatePositions.bind(this));
  }

  addEventListenerWithCleanup(element, type, fn) {
    element.addEventListener(type, fn);
    this.boundEventListeners.set(element, { type, fn });
  }
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        resolve();
      };
      script.onerror = (error) => {
        reject(error);
      };
      document.head.appendChild(script);
    });
  }

  render() {
    this.shadowRoot.innerHTML = getHtml(
      this.size,
      buttonSize,
      iconWidth,
      widgetSpace
    );

    this.updatePositions();
  }

  setupListeners() {
    const button = this.shadowRoot.querySelector('.chat-button');
    button.addEventListener('click', () => {
      this.toggleChat();
    });
    this.setupSideResize();
  }

  moveToPosition(position) {
    this.position = position;
    this.updatePositions();
  }

  setupSideResize() {
    const container = this.shadowRoot.getElementById('container');
    const outline = this.shadowRoot.querySelector('.resize-outline');
    const leftHandle = this.shadowRoot.querySelector('#resize-side.left');
    const rightHandle = this.shadowRoot.querySelector('#resize-side.right');
    const iframe = this.shadowRoot.querySelector('iframe');

    const minMargin = parseInt(offset);

    let startX, startWidth, startLeft;

    const onPress = (event, isRight) => {
      event.preventDefault();
      event.stopPropagation();
      iframe.style.pointerEvents = 'none';

      const rect = container.getBoundingClientRect();
      startX = event.clientX;
      startWidth = rect.width;
      startLeft = rect.left;

      outline.style.display = 'block';
      outline.style.width = `${startWidth}px`;
      outline.style.height = `${rect.height}px`;
      outline.style.left = `${startLeft}px`;
      outline.style.top = `${rect.top}px`;

      const onMove = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const diffX = event.clientX - startX;
        let newWidth = startWidth;
        let newLeft = startLeft;

        if (this.position.includes('right')) {
          if (isRight) {
            newWidth = Math.max(minWidth, startWidth + diffX);
          } else {
            newWidth = Math.max(minWidth, startWidth - diffX);
            newLeft = startLeft + diffX;
          }
        } else {
          if (isRight) {
            newWidth = Math.max(minWidth, startWidth + diffX);
          } else {
            newWidth = Math.max(minWidth, startWidth - diffX);
            newLeft = startLeft + diffX;
          }
        }

        const windowWidth = window.innerWidth;

        const effectiveMargin = this.isDrawer ? 0 : minMargin;

        if (newLeft + newWidth > windowWidth - effectiveMargin) {
          if (this.position.includes('right')) {
            newLeft = windowWidth - effectiveMargin - newWidth;
          } else {
            newWidth = windowWidth - effectiveMargin - newLeft;
          }
        }

        if (newLeft < effectiveMargin) {
          newLeft = effectiveMargin;
          if (this.position.includes('right')) {
            newWidth = startWidth + (startLeft - effectiveMargin);
          }
        }

        outline.style.width = `${newWidth}px`;
        outline.style.left = `${newLeft}px`;
      };

      const onRelease = (event) => {
        event.preventDefault();
        event.stopPropagation();

        outline.style.display = 'none';
        container.style.width = outline.style.width;
        container.style.left = outline.style.left;

        this.size.width = parseInt(outline.style.width);

        iframe.style.pointerEvents = '';

        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onRelease);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onRelease);
    };

    const updateHandleStyle = (width) => {
      const windowWidth = window.innerWidth;
      const widthPercentage = (width / windowWidth) * 100;
      const isWide = widthPercentage > 80;

      const leftHandle = this.shadowRoot.querySelector(
        '#resize-side.left .side-handle-wrapper'
      );
      const rightHandle = this.shadowRoot.querySelector(
        '#resize-side.right .side-handle-wrapper'
      );

      if (leftHandle) {
        const leftHandleInner = leftHandle.querySelector('#resize-side-handle');
        if (leftHandleInner) {
          leftHandleInner.style.borderLeft = isWide
            ? '3px solid white'
            : 'none';
          leftHandleInner.style.borderRight = isWide
            ? 'none'
            : '3px solid white';
        }
      }

      if (rightHandle) {
        const rightHandleInner = rightHandle.querySelector(
          '#resize-side-handle'
        );
        if (rightHandleInner) {
          rightHandleInner.style.borderRight = isWide
            ? '3px solid white'
            : 'none';
          rightHandleInner.style.borderLeft = isWide
            ? 'none'
            : '3px solid white';
        }
      }

      return isWide;
    };

    const handleExpandClick = (event, isRight) => {
      event.preventDefault();
      event.stopPropagation();

      const container = this.shadowRoot.getElementById('container');

      const minMargin = parseInt(offset);
      const windowWidth = window.innerWidth;
      const rect = container.getBoundingClientRect();

      const isCurrentlyWide = updateHandleStyle(rect.width);

      let newWidth, newLeft;

      if (isCurrentlyWide) {
        newWidth = minWidth;
        if (this.position.includes('right')) {
          newLeft = windowWidth - newWidth - minMargin;
        } else {
          newLeft = rect.left;
        }
      } else {
        if (this.position.includes('right')) {
          if (isRight) {
            newWidth = windowWidth - rect.right + rect.width - minMargin;
            newLeft = windowWidth - newWidth - minMargin;
          } else {
            newWidth = rect.right - minMargin;
            newLeft = minMargin;
          }
        } else {
          if (isRight) {
            newWidth = windowWidth - rect.left - minMargin;
          } else {
            newWidth = windowWidth - minMargin - rect.left;
          }
          newLeft = rect.left;
        }
      }

      container.style.transition = 'all 0.3s ease';
      container.style.width = `${newWidth}px`;
      container.style.left = `${newLeft}px`;

      setTimeout(() => {
        container.style.transition = '';
        this.size.width = newWidth;
        updateHandleStyle(newWidth);
      }, 300);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateHandleStyle(entry.contentRect.width);
      }
    });

    resizeObserver.observe(container);

    if (this.position.includes('right')) {
      const leftHandle = this.shadowRoot.querySelector(
        '#resize-side.left .side-handle-wrapper'
      );
      this.addEventListenerWithCleanup(leftHandle, 'click', (e) =>
        handleExpandClick(e, false)
      );
    } else if (this.position.includes('left')) {
      const rightHandle = this.shadowRoot.querySelector(
        '#resize-side.right .side-handle-wrapper'
      );
      this.addEventListenerWithCleanup(rightHandle, 'click', (e) =>
        handleExpandClick(e, true)
      );
    }

    this.addEventListenerWithCleanup(window, 'beforeunload', () => {
      resizeObserver.disconnect();
    });

    if (this.position.includes('right')) {
      const leftHandle = this.shadowRoot.querySelector(
        '#resize-side.left .side-handle-wrapper'
      );
      this.addEventListenerWithCleanup(leftHandle, 'click', (e) =>
        handleExpandClick(e, false)
      );
    } else if (this.position.includes('left')) {
      const rightHandle = this.shadowRoot.querySelector(
        '#resize-side.right .side-handle-wrapper'
      );
      this.addEventListenerWithCleanup(rightHandle, 'click', (e) =>
        handleExpandClick(e, true)
      );
    }

    leftHandle.style.display = 'none';
    rightHandle.style.display = 'none';

    if (this.position.includes('right')) {
      leftHandle.style.display = 'block';
      this.addEventListenerWithCleanup(leftHandle, 'mousedown', (e) =>
        onPress(e, false)
      );
    } else if (this.position.includes('left')) {
      rightHandle.style.display = 'block';
      this.addEventListenerWithCleanup(rightHandle, 'mousedown', (e) =>
        onPress(e, true)
      );
    }
  }

  updatePositions() {
    const wrapper = this.shadowRoot.querySelector('.wrapper');
    const container = this.shadowRoot.querySelector('.chat-container');
    wrapper.style.top = '';
    wrapper.style.right = '';
    wrapper.style.bottom = '';
    wrapper.style.left = '';

    container.style.top = '';
    container.style.right = '';
    container.style.bottom = '';
    container.style.left = '';
    switch (this.position) {
      case 'top-left':
        wrapper.style.top = offset;
        wrapper.style.left = offset;
        container.style.top = this.isDrawer
          ? '0'
          : `calc(${widgetSpace} + anchor(--button bottom))`;
        container.style.left = this.isDrawer
          ? '0'
          : `calc(0px + anchor(--button left))`;
        break;

      case 'top-right':
        wrapper.style.top = offset;
        wrapper.style.right = offset;
        container.style.top = this.isDrawer
          ? '0'
          : `calc(${widgetSpace} + anchor(--button bottom))`;
        container.style.right = this.isDrawer
          ? '0'
          : `calc(0px + anchor(--button right))`;
        break;

      case 'bottom-left':
        wrapper.style.bottom = offset;
        wrapper.style.left = offset;
        container.style.bottom = this.isDrawer
          ? '0'
          : `calc(${widgetSpace} + anchor(--button top))`;
        container.style.left = this.isDrawer
          ? '0'
          : `calc(0px + anchor(--button left))`;
        break;

      case 'bottom-right':
      default:
        wrapper.style.bottom = offset;
        wrapper.style.right = offset;
        container.style.bottom = this.isDrawer
          ? '0'
          : `calc(${widgetSpace} + anchor(--button top))`;
        container.style.right = this.isDrawer
          ? '0'
          : `calc(0px + anchor(--button right))`;
        break;
    }

    wrapper.style.position = 'fixed';
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const container = this.shadowRoot.querySelector('.chat-container');
    const button = this.shadowRoot.querySelector('.chat-button');
    container.classList.toggle('open', this.isOpen);

    const svgIcons = button.querySelectorAll('svg:not(.x-icon)');
    const xIcon = button.querySelector('.x-icon');

    if (this.isOpen) {
      button.classList.add('open');
      svgIcons.forEach((icon) => icon.classList.add('scaled'));
      xIcon.classList.remove('scaled');
      xIcon.style.transform = 'scale(0.6)';
    } else {
      button.classList.remove('open');
      svgIcons.forEach((icon) => icon.classList.remove('scaled'));
      xIcon.classList.add('scaled');
    }
  }

  enableButtonDragging() {
    const createPlaceholder = () => {
      const placeholder = document.createElement('div');
      placeholder.style.position = 'fixed';
      placeholder.style.width = buttonSize.width;
      placeholder.style.height = buttonSize.height;
      placeholder.style.borderRadius = '50%';
      placeholder.style.border = '2px dashed #3F72AF';
      placeholder.style.opacity = '0';
      placeholder.style.transition = 'opacity 0.2s ease';
      placeholder.style.pointerEvents = 'none';
      placeholder.style.zIndex = '9997';
      return placeholder;
    };

    const button = this.shadowRoot.querySelector('.chat-button');
    const buttonWrapper = this.shadowRoot.querySelector('.button-wrapper');
    let ghostButton;
    let placeholder;
    let isDragging = false;
    let startX, startY;

    const threshold = 10;

    const onMouseDown = (event) => {
      startX = event.clientX;
      startY = event.clientY;
      isDragging = false;
      this.wasOpenBeforeDrag = this.isOpen;
      ghostButton = document.createElement('button');
      ghostButton.className = 'chat-button';
      placeholder = createPlaceholder();
      document.body.appendChild(placeholder);

      const messageIconClone = button
        .querySelector('svg:not(.x-icon)')
        .cloneNode(true);

      ghostButton.appendChild(messageIconClone);
      ghostButton.style.position = 'fixed';
      ghostButton.style.width = buttonSize.width;
      ghostButton.style.border = '0';
      ghostButton.style.cursor = 'pointer';
      ghostButton.style.height = buttonSize.height;
      ghostButton.style.background = config.colors.primary;
      ghostButton.style.borderRadius = '50%';
      ghostButton.style.opacity = '0.8';
      ghostButton.style.pointerEvents = 'none';
      ghostButton.style.zIndex = '0';
      ghostButton.style.display = 'flex';
      ghostButton.style.justifyContent = 'center';
      ghostButton.style.alignItems = 'center';
      ghostButton.querySelector('svg').style.fill = config.colors.background;
      ghostButton.querySelector('svg').style.stroke = config.colors.primary;
      ghostButton.querySelector('svg').style.width = iconWidth;
      ghostButton.querySelector('svg').style.top = '25%';
      ghostButton.querySelector('svg').style.left = '20%';
      ghostButton.querySelector('.stars').style.fill = config.colors.background;
      ghostButton.querySelector('.stars').style.stroke = config.colors.primary;
      ghostButton.querySelector('.stars').style.position = 'absolute';
      ghostButton.querySelector('.stars').style.width = '24px';
      ghostButton.querySelector('.stars').style.top = '10px';
      ghostButton.querySelector('.stars').style.right = '10px';

      document.body.appendChild(ghostButton);
      const buttonRect = button.getBoundingClientRect();
      ghostButton.style.top = `${buttonRect.top}px`;
      ghostButton.style.left = `${buttonRect.left}px`;

      const onMouseMove = (event) => {
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > threshold) {
          button.style.opacity = '0';
          buttonWrapper.style.opacity = '0';

          if (this.isOpen) {
            this.toggleChat();
          }

          if (!isDragging) {
            isDragging = true;
            placeholder.style.opacity = '0.6';
          }

          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const ghostRect = ghostButton.getBoundingClientRect();
          const buttonCenterX = ghostRect.left + ghostRect.width / 2;
          const buttonCenterY = ghostRect.top + ghostRect.height / 2;
          const isRight = buttonCenterX > viewportWidth / 2;
          const isBottom = buttonCenterY > viewportHeight / 2;

          // Update placeholder position
          const offsetNum = parseInt(offset);
          const snapX = isRight
            ? viewportWidth - ghostButton.offsetWidth - offsetNum
            : offsetNum;

          const snapY = isBottom
            ? viewportHeight - ghostButton.offsetHeight - offsetNum
            : offsetNum;

          placeholder.style.left = `${snapX}px`;
          placeholder.style.top = `${snapY}px`;

          // Update ghost button position
          const bounds = {
            left: 0,
            top: 0,
            right: viewportWidth - ghostButton.offsetWidth,
            bottom: viewportHeight - ghostButton.offsetHeight,
          };

          let newLeft = buttonRect.left + (event.clientX - startX);
          let newTop = buttonRect.top + (event.clientY - startY);

          newLeft = Math.min(Math.max(newLeft, bounds.left), bounds.right);
          newTop = Math.min(Math.max(newTop, bounds.top), bounds.bottom);

          ghostButton.style.left = `${newLeft}px`;
          ghostButton.style.top = `${newTop}px`;
        }
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        if (!isDragging) {
          if (ghostButton && ghostButton.parentNode) {
            ghostButton.parentNode.removeChild(ghostButton);
          }
          if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
          }
          return;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const ghostRect = ghostButton.getBoundingClientRect();
        const buttonCenterX = ghostRect.left + ghostRect.width / 2;
        const buttonCenterY = ghostRect.top + ghostRect.height / 2;
        const isRight = buttonCenterX > viewportWidth / 2;
        const isBottom = buttonCenterY > viewportHeight / 2;

        let newPosition;
        if (isRight) {
          newPosition = isBottom ? 'bottom-right' : 'top-right';
        } else {
          newPosition = isBottom ? 'bottom-left' : 'top-left';
        }

        if (this.position !== newPosition) {
          this.position = newPosition;
          this.dispatchEvent(
            new CustomEvent('positionChange', {
              detail: { position: newPosition },
            })
          );
        }

        const offsetNum = parseInt(offset);
        const snapX = isRight
          ? viewportWidth - ghostButton.offsetWidth - offsetNum
          : offsetNum;

        const snapY = isBottom
          ? viewportHeight - ghostButton.offsetHeight - offsetNum
          : offsetNum;

        ghostButton.style.transition = 'all 0.3s ease';
        ghostButton.style.left = `${snapX}px`;
        ghostButton.style.top = `${snapY}px`;

        const animationComplete = new Promise((resolve) => {
          setTimeout(resolve, 300);
        });

        animationComplete.then(() => {
          if (ghostButton && ghostButton.parentNode) {
            ghostButton.parentNode.removeChild(ghostButton);
          }
          if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
          }

          this.updatePositions();
          this.setupSideResize();

          button.style.opacity = '100';
          buttonWrapper.style.opacity = '100';
          if (this.wasOpenBeforeDrag) {
            setTimeout(() => {
              this.toggleChat();
            }, 50);
          }
        });
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    button.addEventListener('mousedown', onMouseDown);
  }
}

customElements.define('chat-widget', ChatWidget);

document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('chat-widget')) {
    const chatWidget = document.createElement('chat-widget');
    document.body.appendChild(chatWidget);
  }
});