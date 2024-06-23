import { useCallback, useState } from "react";

export const useComponentStyles = () => {
  const [styles, setStyles] = useState({
    backgroundColor: "#",
    color: "#",
    width: "#",
    height: "#",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedValue = (name === "width" || name === "height") ? `${value}px` : value;
    setStyles((prevStyles) => ({
      ...prevStyles,
      [name]: updatedValue,
    }));
  };

  const handleChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "width") {
      const updatedWidth = `${value}px`;
      setStyles((prevStyles) => ({
        ...prevStyles,
        width: updatedWidth,
        height: updatedWidth,
      }));
    } else {
      setStyles((prevStyles) => ({
        ...prevStyles,
        [name]: value,
      }));
    }
  };

  const getStyles = useCallback(() => styles, [styles]);

  return { styles, handleChange, handleChange2, getStyles };
};
