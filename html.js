/* eslint-env browser */

import { config } from './config.js';
const closeIcon = config.closeIcon;
const buttonIcon = config.buttonIcon;

export const getHtml = (size) => /*html*/ `
      <style>
        :host {
           --primary-color: ${config.colors.primary};
           --background-color: ${config.colors.background};
           --shadow-color: rgba(0, 0, 0, 0.15);
           --outline-color: rgba(7, 12, 19, 0.5);
           --outline-background: ${config.colors.outlineBackground};
           --button-width: ${config.buttonSize.width};
           --button-height: ${config.buttonSize.height};
           --button-icon-size: ${config.iconWidth};
           --border-radius: 12px;
           --chat-width: ${size.width};
           --chat-height: ${size.height};
           --transition-duration: 0.4s;
           --widget-space: ${config.widgetSpace};
      }
           .wrapper {
               position: fixed;
               z-index: 9998;
               touch-action: none;
               display: flex;
               align-items: center;
               justify-content: center;
               height: fit-content;
               width: fit-content;
          }
           .button-wrapper{
               box-shadow: 0px 5px 8px 0px #00000060;
               border-radius: 50%;
               transition: box-shadow 0.3s;
          }
           .button-wrapper:hover{
               box-shadow: 0px 9px 10px 0px #00000060;
          }
           .chat-button {
               width: var(--button-width);
               height: var(--button-height);
               border-radius: 50%;
               background: var(--background-color);
               border: 2px solid var(--primary-color);
               cursor: pointer;
               box-shadow: inset 0 0 0 0px var(--primary-color);
               display: flex;
               align-items: center;
               justify-content: center;
               touch-action: none;
               transition: box-shadow var(--transition-duration), background-color var(--transition-duration);
               transition-timing-function: cubic-bezier(0.9, 0, 0.3, 1.2);
               position: relative;
               anchor-name: --button;
          }
           .chat-button:hover,
           .chat-button.open{
               border: none;
               box-shadow: inset 0 0 0 var(--button-height) var(--primary-color);
               transition-delay: 0s, 0s, 0.1s;
          }

          .chat-button svg {
               width: var(--button-icon-size);
               height: var(--button-icon-size);
               fill: var(--primary-color);
               transition: transform var(--transition-duration), fill var(--transition-duration), opacity var(--transition-duration);
               position: relative;
               transform: scale(1);
               opacity: 1;
          }
           .chat-button svg.scaled {
               transform: scale(0);
               opacity: 0;
          }
           .chat-button svg.x-icon {
               position: absolute;
               fill: var(--primary-color);
               transform: scale(0);
          }
           .chat-button.open svg.x-icon {
               transform: scale(1);
          }
           .chat-button svg .stars {
               opacity: 1;
               fill: var(--primary-color);
               transition: transform var(--transition-duration), fill var(--transition-duration), stroke var(--transition-duration);
               stroke: var(--background-color);
               transform-origin: center;
          }
           @keyframes shine {
               0% {
                   mask-position: 150%;
              }
             5% {
                   mask-position: 150%;
              }
               15% {
                   mask-position: -50%;
              }
               100% {
                   mask-position: -50%;
              }
          }
           .chat-button:hover svg .stars {
               fill: var(--background-color);
               top: 10px;
               right: 10px;
               stroke: var(--primary-color);
               transition-delay: 0.0s, 0.0s, 0.0s, 0.25s;
               mask-image: linear-gradient( -75deg, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 1) 70% );
               mask-size: 200%;
               animation: shine 6s ease-in-out infinite;
          }
           .chat-button:not(:hover) svg .stars {
               top: 8px;
               right: 8px;
               opacity: 1;
               scale: 1;
               transition-delay: 0.1s;
          }
           .chat-button:hover svg,
           .chat-button.open svg{
               fill: var(--background-color);
          }
           .chat-container {
               position: fixed;
               width: var(--chat-width);
               height: var(--chat-height);
               background: var(--background-color);
               border-radius: var(--border-radius);
               box-shadow: 0 5px 20px var(--shadow-color);
               display: flex;
               flex-direction: column;
               opacity: 0;
               transform: scale(0.2);
               pointer-events: none;
               transition: opacity var(--transition-duration), transform var(--transition-duration);
          }
          .wrapper[style*="bottom:"][style*="right:"] .chat-container {
                transform-origin: bottom right;
            }

            .wrapper[style*="bottom:"][style*="left:"] .chat-container {
                transform-origin: bottom left;
            }

            .wrapper[style*="top:"][style*="right:"] .chat-container {
                transform-origin: top right;
            }

            .wrapper[style*="top:"][style*="left:"] .chat-container {
                transform-origin: top left;
            }
           .bottomRight {
               right: 0;
               bottom: 0;
               cursor: nwse-resize;
          }
           .bottomLeft {
               left: 0;
               bottom: 0;
               cursor: nesw-resize;
          }
           .topLeft {
               left: 0;
               top: 0;
               cursor: nwse-resize;
          }
           .topRight {
               right: 0;
               top: 0;
               cursor: nesw-resize;
          }
           .resize-outline {
               display: none;
               position: fixed;
               border: 3px solid var(--primary-color);
               pointer-events: none;
               z-index: 9999;
               background: var(--outline-background);
               box-sizing: border-box;
               border-radius: var(--border-radius);
          }
           .chat-container.open {
               opacity: 1;
               transform: scale(1);
               pointer-events: all;
          }
           .chat-container.open .resize-handle {
               display: block;
          }
          .wrapper[style*="bottom:"][style*="right:"] .chat-container {
                transform-origin: bottom right;
            }
            .wrapper[style*="bottom:"][style*="left:"] .chat-container {
                transform-origin: bottom left;
            }
            .wrapper[style*="top:"][style*="right:"] .chat-container {
                transform-origin: top right;
            }
            .wrapper[style*="top:"][style*="left:"] .chat-container {
                transform-origin: top left;
            }
           iframe {
               width: 100%;
               height: 100%;
               border: none;
               border-radius: var(--border-radius);
          }
           #resize-side-handle {
               opacity: 0;
               position: absolute;
               top: 50%;
               width: 0;
               height: 0;
               transition: all 0.3s;
          }
           .right #resize-side-handle {
               right: 0;
               border-left: 3px solid white;
               border-top: 3px solid transparent;
               border-bottom: 3px solid transparent;
          }
           .left #resize-side-handle {
               left: 0;
               border-right: 3px solid white;
               border-top: 3px solid transparent;
               border-bottom: 3px solid transparent;
          }
           #resize-side {
               position: absolute;
               height: 98%;
               width: 4px;
               top: 1%;
               cursor: ew-resize;
          }
           #resize-side.right {
               right: 0px;
          }
           #resize-side.left {
               left: 0px;
          }
           #resize-side > div {
               position: absolute;
               width: 100%;
               height: 100%;
               background: transparent;
               transition: all 0.3s;
          }
           #resize-side.right > div {
               border-radius: 0px 6px 6px 0px;
          }
           #resize-side.left > div {
               border-radius: 6px 0px 0px 6px;
          }
           #resize-side:hover > div{
               background: var(--primary-color);
          }
           #resize-side:hover #resize-side-handle{
               opacity: 100;
          }
          .side-handle-wrapper{
            height: 20px;
            width: 15px;
            top: 50%;
            position: absolute;
            cursor: pointer;
          }
          .side-handle-wrapper.left{
            left: 0px;
          }
          .side-handle-wrapper.right{
            right: 0px;
          }
      </style>

      <div class="wrapper">
      <div class="button-wrapper">
        <button class="chat-button">
         ${buttonIcon}
         ${closeIcon}
        </button>
        </div>
        <div class="resize-outline"></div>
        <div id="container" class="chat-container">
          <div id="resize-side" class="left"><div><div class="side-handle-wrapper left"><div id="resize-side-handle"></div></div></div></div>
          <div id="resize-side" class="right"><div><div class="side-handle-wrapper right"><div id="resize-side-handle"></div></div></div></div>
          <div class="bottomRight"></div>
          <div class="topLeft"></div>
          <div class="topRight"></div>
          <div class="bottomLeft"></div>
        </div>
      </div>
    `;
