import React, { useState } from 'react';

const ColorPicker = ({ color, onChange }) => {
  const [selectedColor, setSelectedColor] = useState(color);

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
  };

  const handleApply = () => {
    onChange(selectedColor);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Выбор цвета</label>
        <input
          type="color"
          value={selectedColor}
          onChange={handleColorChange}
          className="w-24 h-10"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Применить
        </button>
      </div>
    </div>
  );
};

export default ColorPicker;
