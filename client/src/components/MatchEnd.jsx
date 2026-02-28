import React from 'react';

const MatchEnd = ({ players, myPlayerId, winnerId, reason, onPlayAgain }) => {
    const isWinner = winnerId === myPlayerId;
    const isDraw = !winnerId;
    const opponent = Object.values(players).find(p => p.id !== myPlayerId);
    const me = Object.values(players).find(p => p.id === myPlayerId);

    let title = "Match Over";
    let subtitle = "Good game!";
    let bgGradient = "from-gray-800 to-gray-900";
    let textColor = "text-white";

    if (isWinner) {
        title = "VICTORY!";
        subtitle = "You crushed your opponent!";
        bgGradient = "from-indigo-900 to-purple-900";
        textColor = "text-yellow-400";
    } else if (!isDraw && winnerId) {
        title = "DEFEAT";
        subtitle = "Better luck next time.";
        bgGradient = "from-red-900 to-gray-900";
        textColor = "text-red-400";
    } else if (isDraw) {
        title = "DRAW";
        subtitle = "A battle evenly matched.";
        bgGradient = "from-blue-900 to-gray-900";
        textColor = "text-blue-300";
    }

    if (reason === "disconnect") {
        subtitle = "Opponent fled the battlefield!";
    }

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br ${bgGradient}`}>
            <div className="bg-gray-800/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-gray-700 text-center max-w-lg w-full">
                <h1 className={`text-6xl font-black mb-4 drop-shadow-lg ${textColor} animate-bounce`}>
                    {title}
                </h1>
                <p className="text-xl text-gray-300 mb-10 font-medium">{subtitle}</p>

                <div className="flex justify-center items-end gap-12 mb-12">
                    <div className="flex flex-col items-center">
                        <span className="text-gray-400 mb-2 font-bold">{me?.username}</span>
                        <span className="text-5xl font-black text-indigo-400">{me?.score || 0}</span>
                    </div>
                    <div className="text-3xl font-black text-gray-600 pb-2">-</div>
                    <div className="flex flex-col items-center">
                        <span className="text-gray-400 mb-2 font-bold">{opponent?.username}</span>
                        <span className="text-5xl font-black text-pink-400">{opponent?.score || 0}</span>
                    </div>
                </div>

                <button
                    onClick={onPlayAgain}
                    className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 px-10 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-transform transform active:scale-95 text-lg"
                >
                    Return to Login
                </button>
            </div>
        </div>
    );
};

export default MatchEnd;
