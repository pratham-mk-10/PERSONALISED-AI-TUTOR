import React from 'react';
import ReflectionCore from './ReflectionCore.jsx';
import ReflectionControls from './ReflectionControls.jsx';
import ReflectionMisconception from './ReflectionMisconception.jsx';
import './styles.css';

const ReflectionPlayer = () => {
  return (
    <div className="reflection-player">
      <ReflectionCore />
      <ReflectionControls />
      <ReflectionMisconception />
    </div>
  );
};

export default ReflectionPlayer;
