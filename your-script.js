// content-script.js

(function() {
    // 1) Create the button.
    const button = document.createElement('div');
    button.innerText = 'Open Chatbot';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = 999999; // Large z-index to stay on top
    button.style.padding = '10px 15px';
    button.style.backgroundColor = '#007BFF';
    button.style.color = '#ffffff';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontFamily = 'sans-serif';
  
    // 2) Create the container for the iframe
    const iframeContainer = document.createElement('div');
    iframeContainer.style.position = 'fixed';
    iframeContainer.style.bottom = '70px';
    iframeContainer.style.right = '20px';
    iframeContainer.style.width = '400px';
    iframeContainer.style.height = '500px';
    iframeContainer.style.zIndex = 999999;
    iframeContainer.style.display = 'none'; // hidden by default
  
    // 3) Create the iframe
    const iframe = document.createElement('iframe');
    // The source here can be local HTML inside your extension or remote
    // If local, use the extension's chrome-extension://<EXT_ID>/iframe.html
    iframe.src = chrome.runtime.getURL('iframe.html');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '1px solid #ccc';
    iframe.style.borderRadius = '4px';
  
    // 4) Append iframe to the container
    iframeContainer.appendChild(iframe);
  
    // 5) Add button and iframe container to the page
    document.body.appendChild(button);
    document.body.appendChild(iframeContainer);
  
    // 6) Toggle iframe on button click
    button.addEventListener('click', () => {
      if (iframeContainer.style.display === 'none') {
        iframeContainer.style.display = 'block';
        button.innerText = 'Close Chatbot';
      } else {
        iframeContainer.style.display = 'none';
        button.innerText = 'Open Chatbot';
      }
    });
  })();
