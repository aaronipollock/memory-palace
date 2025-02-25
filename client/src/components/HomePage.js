import React from 'react'
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    const handleDemoClick = () => {
        navigate('/demo');
    };

    const handleUploadClick = () => {
        navigate('/upload');
    };

    return (
        <div className='container mx-auto px-4 py-8 text-center'>
            <h1 className='text-3xl font-bold mb-6'>Welcome to Your Memory Palace</h1>
            <p className='text-lg mb-8'>
                A memory palace is a powerful mnemonic device that leverages spatial memory to help you remember information.
                Use our tool to create your own memory palace by associating images with memorable concepts.
            </p>
            <div className='flex justify-center gap-4'>
                <button
                onClick={handleDemoClick}
                className='px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors duration-300'
                >
                    Try Demo
                </button>
                <button
                onClick={handleUploadClick}
                className='px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors duration-300'
                >
                    Upload Your Images
                </button>
            </div>
        </div>
    );
};

export default HomePage;
