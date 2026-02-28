import React, { useState, useEffect } from 'react';

const GameBoard = ({
    players,
    myPlayerId,
    wordLength,
    revealedTiles,
    timeLeft,
    tickDuration,
    onSubmitGuess,
    hasGuessedThisTick
}) => {
    const [guess, setGuess] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (guess.trim() && !hasGuessedThisTick) {
            onSubmitGuess(guess.trim());
            setGuess('');
        }
    };

    const progressPercent = tickDuration > 0 ? (timeLeft / tickDuration) * 100 : 0;

    const opponent = Object.values(players).find(p => p.id !== myPlayerId);
    const me = Object.values(players).find(p => p.id === myPlayerId);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-between p-4 font-sans">

            <div className="w-full max-w-4xl flex justify-between items-center bg-gray-800 p-4 rounded-2xl shadow-xl mt-4 border border-gray-700">
                <div className="flex flex-col items-start w-1/3">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                        {me?.username} (You)
                    </span>
                    <span className="text-3xl font-black text-indigo-400">{me?.score || 0}</span>
                </div>

                <div className="text-gray-500 font-bold text-2xl w-1/3 text-center tracking-widest">
                    VS
                </div>

                <div className="flex flex-col items-end w-1/3">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-500">
                        {opponent?.username || 'Opponent'}
                    </span>
                    <span className="text-3xl font-black text-pink-400">{opponent?.score || 0}</span>
                </div>
            </div>

            <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center p-8">

                <div className="flex flex-wrap justify-center gap-3 mb-16">
                    {Array.from({ length: wordLength }).map((_, index) => {
                        const revealed = revealedTiles.find(t => t.index === index);
                        return (
                            <div
                                key={index}
                                className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl flex items-center justify-center text-4xl sm:text-5xl font-black shadow-lg transform transition-all duration-500 
                  ${revealed
                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110'
                                        : 'bg-gray-800 border-2 border-gray-700 text-transparent'
                                    }`}
                            >
                                {revealed ? revealed.letter.toUpperCase() : ''}
                            </div>
                        );
                    })}
                </div>

                <div className="w-full max-w-lg mb-8">
                    <div className="flex justify-between text-sm text-gray-400 mb-2 font-semibold">
                        <span>Next Letter Reveals:</span>
                        <span>{(timeLeft / 1000).toFixed(1)}s</span>
                    </div>
                    <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                            style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="w-full max-w-lg relative">
                    <input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        disabled={hasGuessedThisTick}
                        className={`w-full bg-gray-800 border-2 rounded-2xl pl-4 pr-[100px] sm:pl-8 sm:pr-[140px] py-4 text-base sm:text-2xl text-center text-white outline-none transition-all duration-300
              ${hasGuessedThisTick
                                ? 'border-gray-600 opacity-50 cursor-not-allowed'
                                : 'border-indigo-500 focus:border-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.2)] focus:shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                            }`}
                        placeholder={hasGuessedThisTick ? "Waiting for next tick..." : "Type your guess..."}
                        maxLength={wordLength}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={hasGuessedThisTick || !guess.trim()}
                        className="absolute right-2 top-2 bottom-2 sm:right-3 sm:top-3 sm:bottom-3 bg-indigo-600 hover:bg-indigo-500 text-white px-4 sm:px-6 rounded-xl text-sm sm:text-base font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit
                    </button>
                </form>

            </div>
        </div>
    );
};

export default GameBoard;
