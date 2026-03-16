import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Zap, Target, Clock, RefreshCw, Menu, Hash, AlertTriangle } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { translations } from '../utils/translations';

function Results() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        isMultiplayer = false,
        p1Stats = null,
        p2Stats = null,
        wpm = 0, accuracy = 0, mistakes = 0, timeTaken = 0, charsTyped = 0
    } = location.state || {};
    const recordGameSession = useGameStore(state => state.recordGameSession);
    const addToLeaderboard = useGameStore(state => state.addToLeaderboard);
    const leaderboard = useGameStore(state => state.leaderboard);
    const { gameMode, difficulty, appLanguage, player1Name, player2Name } = useGameStore();

    const t = translations[appLanguage];

    // Use a ref to ensure we only record the score once on mount
    const hasRecorded = React.useRef(false);

    React.useEffect(() => {
        // Only record single player games to global progess
        if (!isMultiplayer && !hasRecorded.current && wpm > 0) {
            recordGameSession(wpm, accuracy, charsTyped);

            // Check if top 10 score
            const isHighScore = leaderboard.length < 10 || wpm > (leaderboard[leaderboard.length - 1]?.wpm || 0);
            if (isHighScore) {
                // Typically you'd prompt or have a name set in profile. For now, default "Guest"
                addToLeaderboard({
                    name: 'Player',
                    wpm: wpm,
                    accuracy: accuracy,
                    mode: `${difficulty} ${gameMode}`,
                    date: new Date().toISOString()
                });
            }

            hasRecorded.current = true;
        }
    }, [isMultiplayer, wpm, accuracy, charsTyped, recordGameSession, addToLeaderboard, leaderboard, difficulty, gameMode]);

    let title = t.sessionComplete;
    let subtitle = t.wellDone;

    if (isMultiplayer && p1Stats && p2Stats) {
        // Determine winner
        const p1Score = p1Stats.wpm * (p1Stats.accuracy / 100);
        const p2Score = p2Stats.wpm * (p2Stats.accuracy / 100);

        if (p1Score > p2Score) {
            title = player1Name + " " + t.p1Wins.replace("Player 1 ", "").replace("اللاعب الأول", "").trim();
            subtitle = t.p1WinsSub;
        } else if (p2Score > p1Score) {
            title = player2Name + " " + t.p2Wins.replace("Player 2 ", "").replace("اللاعب الثاني", "").trim();
            subtitle = t.p2WinsSub;
        } else {
            title = t.tie;
            subtitle = t.tieSub;
        }
    }

    const renderStatsGrid = (stats) => (
        <div className="results-grid" style={{ marginTop: '1rem' }}>
            <div className="result-item">
                <span className="result-value">{stats.wpm}</span>
                <span className="result-label">{t.wpm}</span>
            </div>
            <div className="result-item">
                <span className="result-value">{stats.accuracy}%</span>
                <span className="result-label">{t.accuracy}</span>
            </div>
            <div className="result-item">
                <span className="result-value">{stats.mistakes}</span>
                <span className="result-label">{t.mistakes}</span>
            </div>
            <div className="result-item">
                <span className="result-value">{stats.timeTaken}s</span>
                <span className="result-label">{t.timeElapsed}</span>
            </div>
        </div>
    );

    return (
        <div className="app-container" dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
            <header className="header" style={{ marginBottom: '2rem' }}>
                <h1 className="title" style={{ color: 'var(--accent-primary)' }}>{title}</h1>
                <p className="subtitle">{subtitle}</p>
            </header>

            <div className="main-content glass-panel text-center" style={{ maxWidth: isMultiplayer ? '800px' : '600px' }}>

                {isMultiplayer && p1Stats && p2Stats ? (
                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px', background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '15px' }}>
                            <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', marginBottom: '1rem' }}>{player1Name} 🔵</h2>
                            {renderStatsGrid(p1Stats)}
                        </div>
                        <div style={{ flex: 1, minWidth: '300px', background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '15px' }}>
                            <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', marginBottom: '1rem' }}>{player2Name} 🔴</h2>
                            {renderStatsGrid(p2Stats)}
                        </div>
                    </div>
                ) : (
                    renderStatsGrid({ wpm, accuracy, mistakes, timeTaken })
                )}

                <div className="results-actions" style={{ marginTop: '3rem' }}>
                    <button className="next-btn" onClick={() => navigate('/game')}>
                        {t.playAgain}
                    </button>
                    <button className="menu-btn" onClick={() => navigate('/')}>
                        {t.mainMenu}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Results;
