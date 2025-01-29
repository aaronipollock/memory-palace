import React, { useState } from 'react';
import axios from 'axios';

const STRATEGIES = [
    {
        id: 'similarity',
        name: 'Similarity',
        description: 'Pairs items with room features based on visual or functional similarities'
    },
    {
        id: 'contrast',
        name: 'Contrast',
        description: 'Creates memorable associations through stark differences'
    },
    {
        id: 'action',
        name: 'Action',
        description: 'Connects items through imagined interactions or activities'
    }
];

const PairingStrategy = ({ items, roomType, onAssociationsGenerated }) => {
    const [selectedStrategy, setSelectedStrategy] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateAssociations = async () => {
        if (!selectedStrategy) {
            setError('Please select a pairing strategy');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/api/generate-associations', {
                items,
                roomType,
                strategy: selectedStrategy
            });

            if (response.data.associations) {
                onAssociationsGenerated(response.data.associations);
            } else {
                setError('No associations received from server');
            }
        } catch (error) {
            console.error('Error generating associations:', error);
            setError('Failed to generate associations. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] bg-surface rounded-lg">
                <div className="text-primary">
                    <div className="animate-spin mr-2 inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    Generating associations...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface p-6 rounded-lg shadow-lg">
            <h2 className="text-xl text-primary mb-4">Choose a Pairing Strategy</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid gap-4 mb-6">
                {STRATEGIES.map((strategy) => (
                    <div
                        key={strategy.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all
                            ${selectedStrategy === strategy.id
                                ? 'border-primary bg-primary bg-opacity-10'
                                : 'border-gray-200 hover:border-primary'}`}
                        onClick={() => setSelectedStrategy(strategy.id)}
                    >
                        <h3 className="text-lg text-primary mb-1">{strategy.name}</h3>
                        <p className="text-text text-sm">{strategy.description}</p>
                    </div>
                ))}
            </div>

            <button
                onClick={generateAssociations}
                disabled={!selectedStrategy}
                className={`w-full px-4 py-2 rounded-lg transition-all
                    ${selectedStrategy
                        ? 'bg-primary text-white hover:bg-opacity-90'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
                Generate Associations
            </button>
        </div>
    );
};

export default PairingStrategy;
