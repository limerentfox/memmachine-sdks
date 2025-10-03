import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    a11y: {
      element: '#root',
      manual: false,
    },
    viewport: {
      viewports: {
        smallMobile: {
          name: 'Small mobile',
          styles: { width: '320px', height: '568px' },
          type: 'mobile',
        },
        largeMobile: {
          name: 'Large mobile',
          styles: { width: '414px', height: '896px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '800px' },
          type: 'desktop',
        },
      },
    },
    layout: 'centered',
  },
};

export default preview;
