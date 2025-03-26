/**
 * InfoIcon.tsx
 *
 * A simple information icon component used with tooltips.
 */

import React from "react";
import Tooltip from "./Tooltip";

interface InfoIconProps {
  content: string;
  position?: "top" | "right" | "bottom" | "left";
}

const InfoIcon: React.FC<InfoIconProps> = ({ content, position = "top" }) => {
  return (
    <Tooltip content={content} position={position}>
      <div className="inline-flex items-center justify-center ml-2 w-5 h-5 rounded-full bg-blue-700 text-white text-xs font-semibold cursor-pointer hover:bg-blue-600 transition-colors">
        i
      </div>
    </Tooltip>
  );
};

export default InfoIcon;
