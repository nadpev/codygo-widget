/* global React */

const WidgetControls = () => {
  // Use the global React object instead of importing
  const state = React.useState({
    buttonWidth: 70,
    buttonHeight: 70,
    iconWidth: 40,
    offset: 20,
    widgetSpace: 20,
    minWidth: 325,
    primaryColor: '#3F72AF',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    outlineColor: 'rgba(7, 12, 19, 0.5)',
    outlineBackground: 'rgba(176, 199, 227, 0.5)',
    grayBorder: '#E4E4E4',
    borderRadius: 12,
    resizeHandleSize: 16,
    transitionDuration: 0.4,
  });
  const settings = state[0];
  const setSettings = state[1];

  React.useEffect(() => {
    const widget = document.querySelector('chat-widget');
    if (widget) {
      const host = widget.shadowRoot.host;
      if (host) {
        host.style.setProperty('--button-width', `${settings.buttonWidth}px`);
        host.style.setProperty('--button-height', `${settings.buttonHeight}px`);
        host.style.setProperty('--button-icon-size', `${settings.iconWidth}px`);
        host.style.setProperty('--widget-space', `${settings.widgetSpace}px`);
        host.style.setProperty('--min-width', `${settings.minWidth}px`);
        host.style.setProperty('--primary-color', settings.primaryColor);
        host.style.setProperty('--background-color', settings.backgroundColor);
        host.style.setProperty('--shadow-color', settings.shadowColor);
        host.style.setProperty('--outline-color', settings.outlineColor);
        host.style.setProperty(
          '--outline-background',
          settings.outlineBackground
        );
        host.style.setProperty('--gray-border', settings.grayBorder);
        host.style.setProperty('--border-radius', `${settings.borderRadius}px`);
        host.style.setProperty(
          '--resize-handle-size',
          `${settings.resizeHandleSize}px`
        );
        host.style.setProperty(
          '--transition-duration',
          `${settings.transitionDuration}s`
        );
      }
    }
  }, [settings]);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const renderControl = (label, key, type, min, max, step) => {
    const value = settings[key];

    return React.createElement(
      'div',
      { className: 'mb-4' },
      React.createElement(
        'label',
        { className: 'block mb-2 font-medium' },
        label
      ),
      React.createElement(
        'div',
        { className: 'flex items-center gap-4' },
        type === 'range'
          ? React.createElement('input', {
              type: 'range',
              min,
              max,
              step,
              value,
              onChange: (e) => handleChange(key, Number(e.target.value)),
              className: 'flex-1',
            })
          : React.createElement('input', {
              type: 'text',
              value,
              onChange: (e) => handleChange(key, e.target.value),
              className: 'flex-1 p-2 border rounded',
            }),
        type === 'range'
          ? React.createElement('input', {
              type: 'number',
              value,
              onChange: (e) => handleChange(key, Number(e.target.value)),
              className: 'w-20 p-2 border rounded',
            })
          : React.createElement('input', {
              type: 'color',
              value,
              onChange: (e) => handleChange(key, e.target.value),
              className: 'w-20 h-10',
            })
      )
    );
  };

  return React.createElement(
    'div',
    { className: 'w-full max-w-2xl mx-auto bg-white p-6 rounded-lg shadow' },
    React.createElement(
      'h2',
      { className: 'text-2xl font-bold mb-6' },
      'Chat Widget Controls'
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
      React.createElement(
        'div',
        null,
        React.createElement(
          'h3',
          { className: 'text-lg font-semibold mb-4' },
          'Dimensions'
        ),
        renderControl('Button Width', 'buttonWidth', 'range', 40, 120, 1),
        renderControl('Button Height', 'buttonHeight', 'range', 40, 120, 1),
        renderControl('Icon Width', 'iconWidth', 'range', 20, 80, 1),
        renderControl('Offset', 'offset', 'range', 0, 50, 1),
        renderControl('Widget Space', 'widgetSpace', 'range', 0, 50, 1),
        renderControl('Min Width', 'minWidth', 'range', 200, 600, 1),
        renderControl('Border Radius', 'borderRadius', 'range', 0, 24, 1),
        renderControl(
          'Resize Handle Size',
          'resizeHandleSize',
          'range',
          8,
          24,
          1
        ),
        renderControl(
          'Transition Duration',
          'transitionDuration',
          'range',
          0.1,
          2,
          0.1
        )
      ),
      React.createElement(
        'div',
        null,
        React.createElement(
          'h3',
          { className: 'text-lg font-semibold mb-4' },
          'Colors'
        ),
        renderControl('Primary Color', 'primaryColor', 'color'),
        renderControl('Background Color', 'backgroundColor', 'color'),
        renderControl('Shadow Color', 'shadowColor', 'color'),
        renderControl('Outline Color', 'outlineColor', 'color'),
        renderControl('Outline Background', 'outlineBackground', 'color'),
        renderControl('Gray Border', 'grayBorder', 'color')
      )
    )
  );
};

export default WidgetControls;
