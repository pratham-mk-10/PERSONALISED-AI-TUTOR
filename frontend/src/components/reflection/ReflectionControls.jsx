import React from 'react';
import Slider from '../common/Slider.jsx';
import Button from '../common/Button.jsx';

const ReflectionControls = () => {
  return (
    <section className="reflection-controls">
      <h3>Controls</h3>
      <Slider label="Angle of Incidence" min={0} max={90} />
      <Slider label="Mirror Position" min={-10} max={10} />
      <Button label="Reset" />
    </section>
  );
};

export default ReflectionControls;
