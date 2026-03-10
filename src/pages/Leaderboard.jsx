import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award } from 'lucide-react';
import useGameStore from '../store/useGameStore';

function Leaderboard() {
    const navigate = useNavigate();
    const { leaderboard } = useGameStore();

    const renderIcon = (index) => {
        if (index === 0) return <Trophy size={20} color="#F59E0B" />; // Gold
        if (index === 1) return <Medal size={20} color="#9CA3AF" />; // Silver
        if (index === 2) return <Award size={20} color="#B45309" />; // Bronze
        return <span style={{ width: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>{index + 1}</span>;
    };

    return (
        <div className="app-container">
            <header className="header" style={{ marginBottom: '1rem' }}>
                <h1 className="title">Local Leaderboard</h1>
                <p className="subtitle">Top Typists on this Device</p>
            </header>

            <div className="main-content glass-panel menu-panel">

                {leaderboard.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <Trophy size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                        <p>No high scores yet! Play a game to see yourself here.</p>
                    </div>
                ) : (
                    <div className="leaderboard-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.9rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>
                            <span style={{ flex: 1 }}>Rank</span>
                            <span style={{ flex: 2 }}>Name</span>
                            <span style={{ flex: 1, textAlign: 'right' }}>Mode</span>
                            <span style={{ flex: 1, textAlign: 'right' }}>WPM</span>
                            <span style={{ flex: 1, textAlign: 'right' }}>Acc</span>
                        </div>
                        {leaderboard.map((entry, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                background: idx === 0 ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)',
                                borderRadius: '10px',
                                border: idx === 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent'
                            }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>{renderIcon(idx)}</div>
                                <div style={{ flex: 2, fontWeight: 'bold', color: 'var(--text-main)' }}>{entry.name}</div>
                                <div style={{ flex: 1, textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{entry.mode}</div>
                                <div style={{ flex: 1, textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{entry.wpm}</div>
                                <div style={{ flex: 1, textAlign: 'right', color: 'var(--success)' }}>{entry.accuracy}%</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="results-actions" style={{ width: '100%' }}>
                    <button className="menu-btn" style={{ width: '100%' }} onClick={() => navigate('/')}>
                        Back to Menu
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Leaderboard;
