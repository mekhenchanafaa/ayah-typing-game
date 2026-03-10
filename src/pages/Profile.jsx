import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Trophy, Target, Clock, Activity, Hash, BookOpen } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { translations } from '../utils/translations';

function Profile() {
    const navigate = useNavigate();
    const {
        level,
        totalGamesPlayed,
        averageWpm,
        totalAyahsTyped,
        totalCharsTyped,
        bestWpm,
        bestAccuracy,
        appLanguage
    } = useGameStore();

    const t = translations[appLanguage];

    return (
        <div className="app-container" dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
            <header className="header" style={{ marginBottom: '1rem' }}>
                <h1 className="title">{t.profile}</h1>
                <p className="subtitle">Your typing journey metrics</p>
            </header>

            <div className="main-content glass-panel menu-panel">

                <div className="profile-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #38BDF8 0%, #3B82F6 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                        <User size={40} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>{t.level} {level}</h2>
                </div>

                <div className="results-grid" style={{ marginBottom: '2rem' }}>
                    <div className="result-item" style={{ padding: '1.5rem' }}>
                        <Trophy size={24} color="var(--accent-primary)" style={{ marginBottom: '0.5rem' }} />
                        <span className="result-value" style={{ fontSize: '2rem' }}>{bestWpm}</span>
                        <span className="result-label">Best WPM</span>
                    </div>
                    <div className="result-item" style={{ padding: '1.5rem' }}>
                        <Target size={24} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
                        <span className="result-value" style={{ fontSize: '2rem' }}>{bestAccuracy}%</span>
                        <span className="result-label">Best Accuracy</span>
                    </div>
                    <div className="result-item" style={{ padding: '1.5rem' }}>
                        <Hash size={24} color="#F59E0B" style={{ marginBottom: '0.5rem' }} />
                        <span className="result-value" style={{ fontSize: '2rem' }}>{totalCharsTyped}</span>
                        <span className="result-label">Total Characters</span>
                    </div>
                    <div className="result-item" style={{ padding: '1.5rem' }}>
                        <BookOpen size={24} color="#8B5CF6" style={{ marginBottom: '0.5rem' }} />
                        <span className="result-value" style={{ fontSize: '2rem' }}>{totalAyahsTyped || totalGamesPlayed}</span>
                        <span className="result-label">Ayahs Completed</span>
                    </div>
                    <div className="result-item" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
                        <Activity size={24} color="var(--accent-primary)" style={{ marginBottom: '0.5rem' }} />
                        <span className="result-value" style={{ fontSize: '2rem' }}>{averageWpm}</span>
                        <span className="result-label">Average Speed</span>
                    </div>
                </div>

                <div className="results-actions" style={{ width: '100%' }}>
                    <button className="menu-btn" style={{ width: '100%' }} onClick={() => navigate('/')}>
                        {t.backToMenu}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Profile;
