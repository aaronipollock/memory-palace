import React, { useState } from 'react';

const ItemInput = ({ onSubmit }) => {
    const [items, setItems] = useState(['']);

    const handleAddItem = () => {
        setItems([...items, '']);
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleItemChange = (index, value) => {
        const newItems = [...items];
        newItems[index] = value;
        setItems(newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const filteredItems = items.filter(item => item.trim() !== '');
        if (filteredItems.length > 0) {
            onSubmit(filteredItems);
        }
    };

    return (
        <div className="bg-surface p-6 rounded-lg shadow-lg">
            <h2 className="text-xl text-primary mb-4">Enter Items to Remember</h2>
            <form onSubmit={handleSubmit}>
                {items.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange(index, e.target.value)}
                            placeholder="Enter an item"
                            className="flex-1 p-2 border-2 border-primary rounded-lg bg-background text-text"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <div className="flex gap-2 mt-4">
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-all"
                    >
                        Add Item
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
                    >
                        Continue
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ItemInput;
