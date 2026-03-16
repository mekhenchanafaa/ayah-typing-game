import React, { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Clock, Zap, Hash, Menu, Trophy, Play, Pause, AlertTriangle } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { translations } from '../utils/translations';

// Helper to strip Arabic diacritics (Harakat) for easier typing
const stripArabicDiacritics = (text) => {
    if (!text) return "";
    return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
};

// Pure component to prevent re-rendering every character on keystroke
const MemoizedChar = memo(({ char, index, userInputLength, isFinished, isHidden }) => {
    let statusClass = '';

    if (index < userInputLength) {
        // We know what the user typed by getting the character at this specific index from the parent text
        // But since we only pass lengths to memo, we rely on the parent logic to just pass down 'status' directly 
        // Let's refactor this to receive simply the 'status' enum: 'untyped', 'correct', 'incorrect'
    }
});

function Game() {
    const navigate = useNavigate();
    const { difficulty, timerMode, gameMode, isMultiplayer, selectedSurah, typingLanguage, appLanguage, player1Name, player2Name } = useGameStore();
    const t = translations[appLanguage];

    const [ayah, setAyah] = useState(null);
    const [loading, setLoading] = useState(true);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const audioRef = useRef(null);

    // Multiplayer State
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [player1Stats, setPlayer1Stats] = useState(null);
    const [showMultiplayerInterstitial, setShowMultiplayerInterstitial] = useState(false);

    // Game State
    const [userInput, setUserInput] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [hardcoreFailed, setHardcoreFailed] = useState(false);
    const [showText, setShowText] = useState(true); // For memorization mode
    const [mistakes, setMistakes] = useState(0);
    const [totalKeystrokes, setTotalKeystrokes] = useState(0);

    // Derived Stats
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);

    const inputRef = useRef(null);

    const determineAyahFetchUrl = () => {
        // Fetch BOTH uthmani text and Sahih International translation AND Alafasy audio
        if (selectedSurah && selectedSurah.number && selectedSurah.numberOfAyahs) {
            const randomAyahInSurah = Math.floor(Math.random() * selectedSurah.numberOfAyahs) + 1;
            return `https://api.alquran.cloud/v1/ayah/${selectedSurah.number}:${randomAyahInSurah}/editions/quran-uthmani,en.sahih,ar.alafasy`;
        }
        // Fallback to totally random ayah
        const randomNum = Math.floor(Math.random() * 6236) + 1;
        return `https://api.alquran.cloud/v1/ayah/${randomNum}/editions/quran-uthmani,en.sahih,ar.alafasy`;
    };

    const attemptFetchAyah = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(determineAyahFetchUrl());
                const payload = await response.json();

                const arabicData = payload.data[0];
                const englishData = payload.data[1];
                const audioData = payload.data[2];

                let cleanedEnglish = englishData.text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
                let pureArabic = stripArabicDiacritics(arabicData.text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim());

                // Check difficulty length based on chosen typing language
                const targetTextForDifficulty = typingLanguage === 'ar' ? pureArabic : cleanedEnglish;
                const len = targetTextForDifficulty.length;
                let isMatch = false;

                if (selectedSurah) {
                    // If a user specifically chose a Surah, we bypass the length difficulty filter 
                    // because some Surahs might not have any Ayahs of 'easy' or 'hard' length, causing an infinite retry loop.
                    isMatch = true;
                } else {
                    if (difficulty === 'easy' && len <= 70) isMatch = true;
                    else if (difficulty === 'medium' && len > 70 && len <= 150) isMatch = true;
                    else if (difficulty === 'hard' && len > 150) isMatch = true;
                }

                if (isMatch || i === retries - 1) {
                    return {
                        arabic: arabicData.text,
                        english: cleanedEnglish,
                        pureArabic: pureArabic,
                        surahNameEn: arabicData.surah.englishName,
                        surahNameAr: arabicData.surah.name,
                        ayahNumber: arabicData.numberInSurah,
                        audio: audioData.audio
                    };
                }
            } catch (error) {
                console.error("Fetch attempt failed", error);
            }
        }
        return null;
    };

    const initializeGame = async () => {
        setLoading(true);
        // Reset Game State
        setCurrentPlayer(1);
        setPlayer1Stats(null);
        setShowMultiplayerInterstitial(false);
        setUserInput('');
        setStartTime(null);
        setTimeElapsed(0);
        setIsFinished(false);
        setHardcoreFailed(false);
        setWpm(0);
        setAccuracy(100);
        setMistakes(0);
        setTotalKeystrokes(0);
        setShowText(true);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlayingAudio(false);

        const fetchedAyah = await attemptFetchAyah(10); // allow up to 10 attempts to find right length

        if (fetchedAyah) {
            setAyah(fetchedAyah);
            setAudioUrl(fetchedAyah.audio);

            // Calculate dynamic timer if Speed Mode is active
            if (timerMode === 'speed') {
                const requiredCharsPerSec = 4.5; // Very fast
                const targetText = typingLanguage === 'ar' ? fetchedAyah.pureArabic : fetchedAyah.english;
                const calcTime = Math.ceil(targetText.length / requiredCharsPerSec);
                // Give them a flat starting buffer of 2 seconds
                setTimeLeft(calcTime + 2);
            } else if (timerMode === '30s') {
                setTimeLeft(30);
            } else if (timerMode === '60s') {
                setTimeLeft(60);
            } else {
                setTimeLeft(null);
            }
        } else {
            console.error("Failed to fetch Ayah");
        }
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    useEffect(() => {
        initializeGame();
    }, [difficulty]);

    // Memorization Mode Hook (Dynamic based on gameMode)
    useEffect(() => {
        let timeout;
        if (gameMode === 'memorization' && startTime && showText && !isFinished && !hardcoreFailed) {
            timeout = setTimeout(() => {
                setShowText(false);
            }, 5000);
        }
        return () => clearTimeout(timeout);
    }, [gameMode, startTime, showText, isFinished, hardcoreFailed]);

    // Main Timer Hook
    useEffect(() => {
        let interval;
        if (startTime && !isFinished) {
            interval = setInterval(() => {
                const now = Date.now();
                const elapsedSeconds = (now - startTime) / 1000;
                const elapsedMinutes = Math.max(0.01, elapsedSeconds / 60);
                setTimeElapsed(Math.floor(elapsedSeconds));

                // Calculate WPM: (Correct Chars / 5) / Time In Minutes
                if (elapsedMinutes > 0) {
                    const wordsTyped = (userInput.length / 5);
                    const currentWpm = Math.max(0, Math.round(wordsTyped / elapsedMinutes));
                    setWpm(currentWpm);
                }

                // Handle Timed Modes
                if (timeLeft !== null) {
                    setTimeLeft(prev => {
                        const newTime = prev - 0.5; // Since interval is 500ms
                        if (newTime <= 0) {
                            setIsFinished(true);
                            return 0;
                        }
                        return newTime;
                    });
                }

            }, 500);
        }
        return () => clearInterval(interval);
    }, [startTime, isFinished, userInput.length, timeLeft, hardcoreFailed]);

    // Route securely to results if finished
    useEffect(() => {
        if (isFinished && !showMultiplayerInterstitial) {
            const charsTyped = userInput.length;

            if (isMultiplayer && currentPlayer === 1) {
                setPlayer1Stats({
                    wpm,
                    accuracy,
                    mistakes,
                    timeTaken: timeElapsed,
                    charsTyped: charsTyped
                });
                setShowMultiplayerInterstitial(true);
            } else {
                setTimeout(() => {
                    navigate('/results', {
                        state: {
                            isMultiplayer,
                            p1Stats: player1Stats,
                            p2Stats: isMultiplayer ? { wpm, accuracy, mistakes, timeTaken: timeElapsed, charsTyped } : null,
                            wpm,
                            accuracy,
                            mistakes,
                            timeTaken: timeElapsed,
                            charsTyped: charsTyped
                        }
                    });
                }, 1000);
            }
        }
    }, [isFinished, navigate, wpm, accuracy, mistakes, timeElapsed, userInput.length, isMultiplayer, currentPlayer, player1Stats, showMultiplayerInterstitial]);

    const startPlayer2 = () => {
        setShowMultiplayerInterstitial(false);
        setCurrentPlayer(2);
        setUserInput('');
        setStartTime(null);
        setTimeElapsed(0);
        setIsFinished(false);
        setHardcoreFailed(false);
        setWpm(0);
        setAccuracy(100);
        setMistakes(0);
        setTotalKeystrokes(0);
        setShowText(true);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlayingAudio(false);

        // Reset timer
        if (timerMode === 'speed') {
            const requiredCharsPerSec = 4.5;
            const targetText = typingLanguage === 'ar' ? ayah.pureArabic : ayah.english;
            const calcTime = Math.ceil(targetText.length / requiredCharsPerSec);
            setTimeLeft(calcTime + 2);
        } else if (timerMode === '30s') {
            setTimeLeft(30);
        } else if (timerMode === '60s') {
            setTimeLeft(60);
        } else {
            setTimeLeft(null);
        }

        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleInputChange = (e) => {
        if (isFinished || loading || !ayah || hardcoreFailed) return;

        const val = e.target.value;
        const targetText = typingLanguage === 'ar' ? ayah.pureArabic : ayah.english;

        // Prevent typing beyond the length
        if (val.length > targetText.length) return;

        if (!startTime && val.length === 1) {
            setStartTime(Date.now());
        }

        setTotalKeystrokes(prev => prev + 1);

        // Track Mistake Delta
        if (val.length > userInput.length) { // Char added
            const newestChar = val[val.length - 1];
            const targetChar = targetText[val.length - 1];
            if (newestChar !== targetChar) {
                setMistakes(prev => prev + 1);
                if (gameMode === 'hardcore') {
                    setHardcoreFailed(true);
                    return; // Stop processing further input
                }
            }
        }

        setUserInput(val);

        // Calculate accuracy real-time
        const currentAccuracy = Math.max(0, Math.round(((totalKeystrokes - mistakes) / Math.max(totalKeystrokes, 1)) * 100));
        setAccuracy(currentAccuracy);

        // Check Win Condition
        if (val.length === targetText.length) {
            // If user got everything correct, they win. 
            // If we want strict mode, we'd ensure no incorrect chars remain. For now, just reaching the end triggers finish.
            setIsFinished(true);
        }
    };

    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlayingAudio) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlayingAudio(!isPlayingAudio);
        }
    };

    return (
        <div className="app-container" onClick={handleContainerClick} dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlayingAudio(false)}
                />
            )}

            {/* Small Top Bar for Navigation in Game */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', width: '100%', alignItems: 'center' }}>
                <button className="icon-btn" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => navigate('/')}>
                    &larr; {t.quit}
                </button>
                {isMultiplayer && !showMultiplayerInterstitial && (
                    <div style={{ fontWeight: 'bold', color: 'var(--text-main)', padding: '0.4rem 1rem', background: 'var(--bg-secondary)', borderRadius: '20px' }}>
                        {currentPlayer === 1 ? player1Name : player2Name}
                    </div>
                )}
                {timerMode !== 'unlimited' && startTime && !showMultiplayerInterstitial && (
                    <div style={{ color: timeLeft <= 10 ? 'var(--error)' : 'var(--accent-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {Math.ceil(timeLeft)}{t.remaining}
                    </div>
                )}
            </div>

            <main className="main-content glass-panel" style={{ minHeight: '500px' }}>
                {showMultiplayerInterstitial ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '3rem 0' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>{player1Name} {t.p1Finished.replace("Player 1", "").replace("اللاعب الأول", "").trim()}</h2>
                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem' }}>
                            <div className="stat-box" style={{ background: 'var(--bg-secondary)' }}>
                                <div className="stat-value">{player1Stats.wpm}</div>
                                <div className="stat-label">{t.wpm}</div>
                            </div>
                            <div className="stat-box" style={{ background: 'var(--bg-secondary)' }}>
                                <div className="stat-value">{player1Stats.accuracy}%</div>
                                <div className="stat-label">{t.accuracy}</div>
                            </div>
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>{player2Name}, {t.p2Ready.replace("Player 2,", "").replace("اللاعب الثاني،", "").trim()}</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{t.p2Hint}</p>
                        <button className="play-btn" onClick={startPlayer2}>
                            {t.startP2}
                        </button>
                    </div>
                ) : loading ? (
                    <div className="loader"></div>
                ) : ayah ? (
                    <div className="ayah-display">
                        <h2 className="surah-badge" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                            <span>{ayah.surahNameEn} • {ayah.surahNameAr} • Ayah {ayah.ayahNumber}</span>
                            {audioUrl && (
                                <button
                                    className="icon-btn"
                                    style={{ padding: '0.2rem 0.5rem', border: '1px solid var(--panel-border)', borderRadius: '12px' }}
                                    onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
                                    title="Play Recitation (Mishary Alafasy)"
                                >
                                    {isPlayingAudio ? '⏸ Stop' : '▶ Play'}
                                </button>
                            )}
                        </h2>
                        <p className="arabic-text">{ayah.arabic}</p>

                        <div className={`typing-area ${!showText && 'memorization-hidden'}`}>
                            <input
                                ref={inputRef}
                                type="text"
                                className="hidden-input"
                                value={userInput}
                                onChange={handleInputChange}
                                autoFocus
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                            />

                            <p className={typingLanguage === 'ar' ? "arabic-typing-text" : "english-text"} dir={typingLanguage === 'ar' ? "rtl" : "ltr"} style={typingLanguage === 'ar' ? { fontSize: '2.5rem', lineHeight: '1.8' } : {}}>
                                {(typingLanguage === 'ar' ? ayah.pureArabic : ayah.english).split('').map((char, index) => {
                                    let status = 'untyped';
                                    const currentTarget = typingLanguage === 'ar' ? ayah.pureArabic : ayah.english;
                                    if (index < userInput.length) {
                                        status = char === userInput[index] ? 'correct' : 'incorrect';
                                    }

                                    const showCaret = index === userInput.length && !isFinished;
                                    const isHidden = !showText && index >= userInput.length;

                                    return (
                                        <MemoizedGameChar
                                            key={index}
                                            char={char}
                                            status={status}
                                            showCaret={showCaret}
                                            isHidden={isHidden}
                                        />
                                    );
                                })}
                                {userInput.length === (typingLanguage === 'ar' ? ayah.pureArabic : ayah.english).length && !isFinished && (
                                    <span className="caret"></span>
                                )}
                            </p>

                            {!showText && !hardcoreFailed && (
                                <div style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                    {t.memoActive}
                                </div>
                            )}

                            {hardcoreFailed && (
                                <div style={{ marginTop: '2rem', color: 'var(--error)', fontSize: '1.2rem', fontWeight: 'bold', animation: 'fadeIn 0.5s ease-out' }}>
                                    {t.hardcoreFailed}
                                    <br />
                                    <button className="play-btn" style={{ marginTop: '1rem', width: 'auto', padding: '0.8rem 2rem', fontSize: '1rem' }} onClick={initializeGame}>
                                        {t.tryAgain}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p>Error loading Ayah. Please try again.</p>
                )}

                {/* Live Stats */}
                <div className="stats-container" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                    <div className="stat-box">
                        <div className="stat-value">{wpm}</div>
                        <div className="stat-label">{t.wpm}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-value">{accuracy}%</div>
                        <div className="stat-label">{t.accuracy}</div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Extracting the character render logic to a memoized component completely eliminates typing lag 
// because only the specific character whose 'status' or 'showCaret' props change will re-render.
const MemoizedGameChar = memo(({ char, status, showCaret, isHidden }) => {
    const isSpace = char === ' ';
    const statusClass = status === 'untyped' ? '' : status;

    return (
        <span className="char-container">
            {showCaret && <span className="caret"></span>}
            <span
                className={`char ${statusClass} ${isSpace ? 'space-char' : ''} ${isSpace && status === 'incorrect' ? 'incorrect-space' : ''}`}
                style={{ opacity: isHidden ? 0 : 1, transition: 'opacity 0.5s ease' }}
            >
                {char}
            </span>
        </span>
    );
});

export default Game;
