
import React from "react";
import { getWheelHighlightStyles } from "./styles/wheelItemStyles";

interface WheelHighlightProps {
  itemHeight?: number;
}

const WheelHighlight: React.FC<WheelHighlightProps> = ({ itemHeight = 40 }) => {
  const highlightStyles = getWheelHighlightStyles();
  
  return (
    <div 
      className={highlightStyles} 
      style={{ height: `${itemHeight}px` }}
    />
  );
};

export default WheelHighlight;
