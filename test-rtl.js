const rtl = require('@testing-library/react-native');
const React = require('react');
const { Text } = require('react-native');
console.log(
  'Queries on render:',
  Object.keys(rtl.render(React.createElement(Text, null, 'Hello'))),
);
console.log('screen before:', rtl.screen !== undefined);
console.log('screen getByText before:', typeof rtl.screen.getByText);
