import React from 'react';

interface FullScreenEmbedProps {
    src: string;
    onClose: () => void;
}

const FullScreenEmbed: React.FC<FullScreenEmbedProps> = ({ src, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col z-50">
            <div className="flex justify-end p-2 bg-gray-800">
                <button 
                    onClick={onClose} 
                    className="text-white text-lg font-bold hover:text-gray-300 bg-red-600 hover:bg-red-700 px-4 py-1 rounded"
                >
                    &times; Close
                </button>
            </div>
            <iframe 
                src={src} 
                className="w-full h-full border-0"
                title="Embedded Content"
            ></iframe>
        </div>
    );
};

export default FullScreenEmbed;