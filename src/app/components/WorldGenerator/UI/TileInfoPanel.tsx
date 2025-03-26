/**
 * TileInfoPanel.tsx
 *
 * Component for displaying detailed information about a selected or hovered tile.
 */

import React from "react";

interface TileInfoPanelProps {
  tileInfo: string | null;
  position: "hover" | "selected";
  coordinates?: { x: number; y: number };
}

const TileInfoPanel: React.FC<TileInfoPanelProps> = ({
  tileInfo,
  position,
  coordinates,
}) => {
  if (!tileInfo) return null;

  // For hover info, show a compact panel
  if (position === "hover") {
    return (
      <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-90 p-3 rounded shadow-lg border border-gray-600 text-white text-sm max-w-xs z-10">
        <div className="font-semibold mb-1 text-blue-300 border-b border-gray-600 pb-1">
          Hover Position: X: {coordinates?.x}, Y: {coordinates?.y}
        </div>
        <pre className="text-xs whitespace-pre-wrap">
          {
            // Format the tileInfo to be more readable - just show the first few lines
            tileInfo.split("\n").slice(0, 6).join("\n")
          }
        </pre>
        <div className="text-xs text-gray-400 mt-1 italic">
          Click to select this tile for details
        </div>
      </div>
    );
  }

  // For selected info, show a more detailed panel
  return (
    <div className="absolute bottom-20 left-4 bg-gray-800 bg-opacity-90 p-3 rounded shadow-lg border border-gray-600 text-white text-sm max-w-xs z-10">
      <div className="font-semibold mb-1 text-green-300 border-b border-gray-600 pb-1">
        Selected Tile: X: {coordinates?.x}, Y: {coordinates?.y}
      </div>
      <pre className="text-xs whitespace-pre-wrap overflow-y-auto max-h-60">
        {tileInfo}
      </pre>
    </div>
  );
};

export default TileInfoPanel;
