import React from 'react';
import Layout from '../components/common/Layout.jsx';
import Button from '../components/common/Button.jsx';

const Home = () => {
  return (
    <Layout>
      <h1>Physics AI Tutor</h1>
      <p>Welcome to the interactive reflection tutor.</p>
      <Button label="Start Session" />
    </Layout>
  );
};

export default Home;
