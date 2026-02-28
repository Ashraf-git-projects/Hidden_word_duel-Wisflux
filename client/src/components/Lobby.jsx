import React from 'react';

const Lobby = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-r-4 border-cyan-400 animate-[spin_1.5s_linear_infinite_reverse]"></div>
                    <div className="absolute inset-4 rounded-full border-b-4 border-purple-500 animate-spin"></div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-2 animate-pulse">
                    Searching for Opponent...
                </h2>
                <p className="text-gray-400">
                    Get ready, the duel will start automatically once a match is found.
                </p>
            </div>
        </div>
    );
};

export default Lobby;
