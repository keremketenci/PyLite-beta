import { Icons } from "@/components/Icons";
import React from "react";

interface CustomizeProps {
  styles: {
    backgroundColor: string;
    color: string;
    width: string;
    height: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDelete: () => void;
}

const Customize: React.FC<CustomizeProps> = ({ styles, handleChange, handleDelete }) => {
  // Helper function to strip "px" and return a numerical value
  const stripPx = (value: string) => value.replace("px", "");

  return (
    <div>
      <div>
        <label>
          Background color:
          <input
            type="color"
            name="backgroundColor"
            value={styles.backgroundColor}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <label>
          Text color:
          <input
            type="color"
            name="color"
            value={styles.color}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <label>
          Width:
          <input
            type="range"
            name="width"
            min={10}
            max={500}
            value={stripPx(styles.width)}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <label>
          Height:
          <input
            type="range"
            name="height"
            min={10}
            max={500}
            value={stripPx(styles.height)}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <button className="w-full flex p-2 rounded-xl justify-center" onClick={handleDelete}>
          <span className="text-red-400">{Icons.trash}</span>
        </button>
      </div>
    </div>
  );
};

export default Customize;
