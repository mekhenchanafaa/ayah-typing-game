import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Settings, Moon, Sun, BookOpen, User, Trophy, Globe } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { translations } from '../utils/translations';

function MainMenu() {
    const navigate = useNavigate();
    const {
        theme, setTheme,
        difficulty, setDifficulty,
        timerMode, setTimerMode,
        gameMode, setGameMode,
        isMultiplayer, setIsMultiplayer,
        selectedSurah, setSelectedSurah,
        level, totalGamesPlayed, averageWpm,
        appLanguage, setAppLanguage,
        typingLanguage, setTypingLanguage
    } = useGameStore();

    const [surahs, setSurahs] = React.useState([]);
    const [loadingSurahs, setLoadingSurahs] = React.useState(true);

    const t = translations[appLanguage];

    React.useEffect(() => {
        const fetchSurahs = async () => {
            try {
                const response = await fetch('https://api.alquran.cloud/v1/surah');
                const result = await response.json();
                if (result.code === 200) {
                    setSurahs(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch surahs", error);
            } finally {
                setLoadingSurahs(false);
            }
        };
        fetchSurahs();
    }, []);

    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

    return (
        <div className="app-container" dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
            <header className="header" style={{ marginBottom: '1rem' }}>
                <h1 className="title">{t.title}</h1>
                <p className="subtitle">{t.subtitle}</p>
            </header>

            <div className="main-content glass-panel menu-panel">
                {/* Top Bar for Level and Theme */}
                <div className="menu-top-bar">
                    <div className="level-badge" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')} title={t.profile}>
                        ⭐ {t.level} {level}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setAppLanguage(appLanguage === 'en' ? 'ar' : 'en')} className="icon-btn" title={t.appLanguage}>
                            <Globe size={24} />
                        </button>
                        <button onClick={() => navigate('/leaderboard')} className="icon-btn" title={t.leaderboard}>
                            <Trophy size={24} />
                        </button>
                        <button onClick={() => navigate('/profile')} className="icon-btn" title={t.profile}>
                            <User size={24} />
                        </button>
                        <button onClick={toggleTheme} className="icon-btn" title={t.theme}>
                            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="stats-summary">
                    <div className="stat-item">
                        <span className="stat-label">{t.totalGames}</span>
                        <span className="stat-value">{totalGamesPlayed}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">{t.avgWpm}</span>
                        <span className="stat-value">{averageWpm}</span>
                    </div>
                </div>

                {/* Game Settings */}
                <div className="settings-section">
                    <h3 className="section-title"><Settings size={20} /> {t.settings}</h3>

                    {/* Surah Selection */}
                    <div className="setting-group">
                        <label>{t.selectSurah}</label>
                        <select
                            className="text-input"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--panel-border)', fontSize: '1rem', marginBottom: '0.5rem' }}
                            value={selectedSurah?.number || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (!val) setSelectedSurah(null);
                                else {
                                    const surahObj = surahs.find(s => s.number === Number(val));
                                    if (surahObj) {
                                        setSelectedSurah({ number: surahObj.number, numberOfAyahs: surahObj.numberOfAyahs, name: surahObj.englishName });
                                    }
                                }
                            }}
                            disabled={loadingSurahs}
                        >
                            <option value="">{t.randomSurah}</option>
                            {surahs.map(s => (
                                <option key={s.number} value={s.number}>
                                    {s.number}. {appLanguage === 'ar' ? s.name : s.englishName}
                                </option>
                            ))}
                        </select>
                        <p className="setting-hint">{t.surahHint}</p>
                    </div>

                    <div className="setting-group">
                        <label>{t.typingLanguage}</label>
                        <div className="options-row">
                            <button
                                className={`option-btn ${typingLanguage === 'en' ? 'active' : ''}`}
                                onClick={() => setTypingLanguage('en')}
                            >{t.englishLang}</button>
                            <button
                                className={`option-btn ${typingLanguage === 'ar' ? 'active' : ''}`}
                                onClick={() => setTypingLanguage('ar')}
                                style={{ fontFamily: 'Noto Naskh Arabic' }}
                            >{t.arabicLang}</button>
                        </div>
                    </div>

                    <div className="setting-group">
                        <label>{t.difficulty}</label>
                        <div className="options-row">
                            <button
                                className={`option-btn ${difficulty === 'easy' ? 'active' : ''}`}
                                onClick={() => setDifficulty('easy')}
                            >{t.easy}</button>
                            <button
                                className={`option-btn ${difficulty === 'medium' ? 'active' : ''}`}
                                onClick={() => setDifficulty('medium')}
                            >{t.medium}</button>
                            <button
                                className={`option-btn ${difficulty === 'hard' ? 'active' : ''}`}
                                onClick={() => setDifficulty('hard')}
                            >{t.hard}</button>
                        </div>
                    </div>

                    <div className="setting-group">
                        <label>{t.timerMode}</label>
                        <div className="options-row" style={{ flexWrap: 'wrap' }}>
                            <button
                                className={`option-btn ${timerMode === '30s' ? 'active' : ''}`}
                                onClick={() => setTimerMode('30s')}
                            >30s</button>
                            <button
                                className={`option-btn ${timerMode === '60s' ? 'active' : ''}`}
                                onClick={() => setTimerMode('60s')}
                            >60s</button>
                            <button
                                className={`option-btn ${timerMode === 'unlimited' ? 'active' : ''}`}
                                onClick={() => setTimerMode('unlimited')}
                            >{t.unlimited}</button>
                            <button
                                className={`option-btn ${timerMode === 'speed' ? 'active' : ''}`}
                                onClick={() => setTimerMode('speed')}
                            >{t.speed}</button>
                        </div>
                        {timerMode === 'speed' && (
                            <p className="setting-hint" style={{ color: 'var(--accent-primary)' }}>{t.speedHint}</p>
                        )}
                    </div>

                    <div className="setting-group">
                        <label>{t.gameMode}</label>
                        <div className="options-row">
                            <button
                                className={`option-btn ${gameMode === 'standard' ? 'active' : ''}`}
                                onClick={() => setGameMode('standard')}
                            >{t.standard}</button>
                            <button
                                className={`option-btn ${gameMode === 'memorization' ? 'active' : ''}`}
                                onClick={() => setGameMode('memorization')}
                            ><BookOpen size={16} style={{ marginRight: '4px' }} /> {t.memorization}</button>
                            <button
                                className={`option-btn ${gameMode === 'hardcore' ? 'active' : ''}`}
                                onClick={() => setGameMode('hardcore')}
                            >{t.hardcore}</button>
                        </div>
                        {gameMode === 'memorization' && (
                            <p className="setting-hint">{t.memoHint}</p>
                        )}
                        {gameMode === 'hardcore' && (
                            <p className="setting-hint" style={{ color: 'var(--error)' }}>{t.hardcoreHint}</p>
                        )}
                    </div>

                    <div className="setting-group" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setIsMultiplayer(!isMultiplayer)}>
                            <span>{t.multiplayer}</span>
                            <div className={`toggle-switch ${isMultiplayer ? 'on' : 'off'}`} style={{
                                width: '40px', height: '22px', background: isMultiplayer ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                borderRadius: '11px', position: 'relative', transition: '0.3s'
                            }}>
                                <div style={{
                                    width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                    position: 'absolute', top: '2px', left: isMultiplayer ? (appLanguage === 'ar' ? '-2px' : '20px') : (appLanguage === 'ar' ? '20px' : '2px'), transition: '0.3s'
                                }} />
                            </div>
                        </label>
                        {isMultiplayer && (
                            <p className="setting-hint" style={{ color: 'var(--accent-primary)' }}>{t.multiplayerHint}</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="play-section">
                    <button className="play-btn" onClick={() => navigate('/game')}>
                        <Play size={24} fill="currentColor" /> {t.playGame}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default MainMenu;
