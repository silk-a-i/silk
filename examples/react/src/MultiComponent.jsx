import React from 'react';

const App = () => {
  return (
    <div>
      <NiceHeading>Hello, world!</NiceHeading>
    </div>
  );
};

const NiceHeading = (children = []) => {
  return (
    <h1>{children}</h1>
  );
};

export default App;