import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useGameStore = create(
    persist(
        (set) => ({
            // User Settings
            appLanguage: 'ar', // 'en' or 'ar'
            typingLanguage: 'ar', // 'en' or 'ar'
            theme: 'dark',
            difficulty: 'medium', // 'easy', 'medium', 'hard'
            timerMode: 'unlimited', // '30s', '60s', 'unlimited', 'speed'
            gameMode: 'standard', // 'standard', 'memorization', 'hardcore'
            selectedSurah: null, // null means random from any surah

            // User Progress
            level: 1,
            totalGamesPlayed: 0,
            totalAyahsTyped: 0,
            totalCharsTyped: 0,
            averageWpm: 0,
            bestWpm: 0,
            bestAccuracy: 0,

            // Leaderboard (Local Storage Array)
            leaderboard: [], // Array of { name, wpm, accuracy, date, mode }

            // Multiplayer state
            isMultiplayer: false,
            player1Name: 'Player 1',
            player2Name: 'Player 2',

            // Actions
            setAppLanguage: (lang) => set({ appLanguage: lang }),
            setTypingLanguage: (lang) => set({ typingLanguage: lang }),
            setTheme: (theme) => set({ theme }),
            setDifficulty: (difficulty) => set({ difficulty }),
            setTimerMode: (timerMode) => set({ timerMode }),
            setGameMode: (gameMode) => set({ gameMode }),
            setIsMultiplayer: (isMultiplayer) => set({ isMultiplayer }),
            setPlayer1Name: (name) => set({ player1Name: name }),
            setPlayer2Name: (name) => set({ player2Name: name }),
            setSelectedSurah: (surahId) => set({ selectedSurah: surahId }),

            recordGameSession: (wpm, accuracy, charsTyped) => set((state) => {
                const newTotalGames = state.totalGamesPlayed + 1;
                const newAverageWpm = Math.round(((state.averageWpm * state.totalGamesPlayed) + wpm) / newTotalGames);

                // Simple leveling logic: level up every 5 games played with decent WPM
                const newLevel = Math.floor(newTotalGames / 5) + 1;

                // Optional: Automatically add to leaderboard if high score (or handle in Results component)

                return {
                    totalGamesPlayed: newTotalGames,
                    totalAyahsTyped: state.totalAyahsTyped + 1,
                    totalCharsTyped: state.totalCharsTyped + charsTyped,
                    averageWpm: newAverageWpm,
                    bestWpm: Math.max(state.bestWpm, wpm),
                    bestAccuracy: Math.max(state.bestAccuracy, accuracy),
                    level: newLevel > state.level ? newLevel : state.level
                };
            }),

            addToLeaderboard: (entry) => set((state) => {
                const newLeaderboard = [...state.leaderboard, entry];
                // Sort by WPM descending
                newLeaderboard.sort((a, b) => b.wpm - a.wpm);
                // Keep top 10
                return { leaderboard: newLeaderboard.slice(0, 10) };
            })
        }),
        {
            name: 'quran-typing-storage', // unique name for localStorage
        }
    )
);

export default useGameStore;
