import React, { useState } from 'react';

const Login = ({ onJoin }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            onJoin(username.trim());
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
                        Hidden Word Duel
                    </h1>
                    <p className="text-gray-400">Enter a username to join the arena</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100 transition-colors duration-200 outline-none"
                            placeholder="e.g. WordMaster99"
                            required
                            autoFocus
                            maxLength={20}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform transform active:scale-95"
                    >
                        Find a Match
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
