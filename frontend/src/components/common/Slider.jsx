import React from 'react';

const Slider = ({ label, min = 0, max = 100, step = 1, value, onChange }) => {
  return (
    <div className="slider-control">
      {label && <label>{label}</label>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Slider;
