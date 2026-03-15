import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DEFAULT_PERCENTAGE = 50;
const DEFAULT_ROUNDS_1 = 10;
const DEFAULT_ROUNDS_2 = 0;
const DEFAULT_LIMIT_SECONDS = 6;

const PRIZES = {
  left: {
    0: { fast: 'R$10', slow: 'R$5' },
    1: { fast: 'R$100', slow: 'R$50' },
  },
  right: {
    0: { fast: 'R$100', slow: 'R$50' },
    1: { fast: 'R$10', slow: 'R$5' },
  },
};

function clampInt(value, min, max, fallback) {
  const num = parseInt(value, 10);
  if (Number.isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function buildSequence(percentage, rounds) {
  const perc = clampInt(percentage, 0, 100, DEFAULT_PERCENTAGE) / 100;
  const rodadas = clampInt(rounds, 1, 1000, DEFAULT_ROUNDS_1);
  const nBol = 1000;
  const countOnes = Math.round(nBol * perc);
  const countZeros = nBol - countOnes;

  const pool = [...new Array(countZeros).fill(0), ...new Array(countOnes).fill(1)];
  const sequence = [];
  for (let i = 0; i < rodadas; i += 1) {
    const idx = Math.floor(Math.random() * nBol);
    sequence.push(pool[idx]);
  }
  return sequence;
}

function computeScore({ correct, elapsed, limit }) {
  const fast = elapsed < limit * 1000;
  if (correct) {
    return fast ? 100 : 50;
  }
  return fast ? 10 : 5;
}

export default function MentalLoadScreen() {
  const navigation = useNavigation();

  const [showInstructions, setShowInstructions] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [percentage, setPercentage] = useState(String(DEFAULT_PERCENTAGE));
  const [rounds1, setRounds1] = useState(String(DEFAULT_ROUNDS_1));
  const [rounds2, setRounds2] = useState(String(DEFAULT_ROUNDS_2));
  const [limitSeconds, setLimitSeconds] = useState(String(DEFAULT_LIMIT_SECONDS));

  const [stageIndex, setStageIndex] = useState(0);
  const [stages, setStages] = useState([]);
  const [sequence, setSequence] = useState([]);
  const [turn, setTurn] = useState(0);
  const [wins, setWins] = useState(0);
  const [lefts, setLefts] = useState(0);
  const [results, setResults] = useState([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(DEFAULT_LIMIT_SECONDS);
  const timerRef = useRef(null);
  const lastTurnStartRef = useRef(Date.now());
  const [feedback, setFeedback] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const totalTurns = useMemo(() => results.length + (isPlaying ? 1 : 0), [results, isPlaying]);

  const currentStage = stages[stageIndex] || null;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    setTimer(DEFAULT_LIMIT_SECONDS);
    setTimedOut(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    lastTurnStartRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimedOut(true);
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, turn]);

  const startStage = (index) => {
    const p = clampInt(percentage, 0, 100, DEFAULT_PERCENTAGE);
    const r = clampInt(index === 0 ? rounds1 : rounds2, 1, 9999, DEFAULT_ROUNDS_1);
    const newSequence = buildSequence(p, r);

    const resetStats = index === 0;

    setStageIndex(index);
    setSequence(newSequence);
    setTurn(0);

    if (resetStats) {
      setWins(0);
      setLefts(0);
      setResults([]);
    }

    setGameOver(false);
    setTimedOut(false);

    setIsPlaying(true);
    setFeedback(null);
  };

  const startGame = () => {
    const r1 = clampInt(rounds1, 1, 9999, DEFAULT_ROUNDS_1);

    const stageDefinitions = [{ label: 'Etapa 1', rounds: r1 }];
    const r2 = clampInt(rounds2, 0, 9999, DEFAULT_ROUNDS_2);
    if (r2 > 0) {
      stageDefinitions.push({ label: 'Etapa 2', rounds: r2 });
    }

    setStages(stageDefinitions);
    setShowInstructions(false);
    setGameStarted(true);

    setTimeout(() => {
      startStage(0);
    }, 100);
  };

  const resetGame = () => {
    setShowInstructions(true);
    setGameStarted(false);
    setIsPlaying(false);
    setGameOver(false);
    setTimedOut(false);
    setFeedback(null);
    setStageIndex(0);
    setStages([]);
    setSequence([]);
    setTurn(0);
    setWins(0);
    setLefts(0);
    setResults([]);
  };

  const handleChoice = (choice) => {
    if (!isPlaying || timedOut || gameOver) return;

    const elapsed = Date.now() - lastTurnStartRef.current;
    const currentValue = sequence[turn];
    const correct = (choice === 'left' && currentValue === 1) || (choice === 'right' && currentValue === 0);

    setLefts((prev) => (choice === 'left' ? prev + 1 : prev));
    setWins((prev) => (correct ? prev + 1 : prev));

    setResults((prev) => [...prev, { choice, correct, elapsed }]);

    const prize = PRIZES[choice][currentValue][elapsed < clampInt(limitSeconds, 1, 9999, DEFAULT_LIMIT_SECONDS) * 1000 ? 'fast' : 'slow'];

    setFeedback({ prize, choice, correct, elapsed });
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    setTimeout(() => {
      setFeedback(null);
      const nextTurn = turn + 1;
      if (nextTurn >= sequence.length) {
        // Finish current stage
        const nextStage = stageIndex + 1;
        if (nextStage < stages.length) {
          // Start next stage
          setStageIndex(nextStage);
          setTimeout(() => {
            startStage(nextStage);
          }, 300);
        } else {
          setGameOver(true);
          setIsPlaying(false);
        }
      } else {
        setTurn(nextTurn);
        setIsPlaying(true);
      }
    }, 500);
  };

  const renderSummary = () => {
    const totalRounds = results.length;
    const totalScore = results.reduce((acc, r) => acc + computeScore({ correct: r.correct, elapsed: r.elapsed, limit: clampInt(limitSeconds, 1, 9999, DEFAULT_LIMIT_SECONDS) }), 0);
    const accuracy = totalRounds ? ((results.filter((r) => r.correct).length / totalRounds) * 100).toFixed(1) : 0;
    const leftPct = totalRounds ? ((results.filter((r) => r.choice === 'left').length / totalRounds) * 100).toFixed(1) : 0;
    const totalDuration = results.reduce((acc, r) => acc + r.elapsed, 0);

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Fim de Jogo</Text>
        <Text style={styles.summaryText}>Pontuação total: {totalScore}</Text>
        <Text style={styles.summaryText}>Acertos: {accuracy}%</Text>
        <Text style={styles.summaryText}>Escolhas esquerda: {leftPct}%</Text>
        <Text style={styles.summaryText}>Tempo total: {totalDuration}ms</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={resetGame}>
          <Feather name="refresh-ccw" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Jogar novamente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Feather name="home" size={20} color="#fff" />
          <Text style={styles.secondaryButtonText}>Voltar para a home</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGame = () => {
    const turnLabel = `${turn + 1} / ${sequence.length}`;

    return (
      <View style={styles.gameContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Feather name="x" size={24} color="#d00" />
          </TouchableOpacity>
          <Text style={styles.stageLabel}>{currentStage?.label ?? ''}</Text>
          <View style={styles.timerBadge}>
            <Feather name="clock" size={16} color="#fff" />
            <Text style={styles.timerText}>{timer}s</Text>
          </View>
        </View>

        <View style={styles.instructionsBlock}>
          <Text style={styles.instructionsTitle}>Instruções</Text>
          <Text style={styles.instructionsText}>
            Escolha a caixa esquerda ou direita tentando encontrar a nota de R$100.
            {'\n\n'}Tente responder antes de {limitSeconds} segundos para pontuar mais.
          </Text>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.choiceButton} onPress={() => handleChoice('left')}>
            <Text style={styles.choiceButtonText}>Esquerda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.choiceButton} onPress={() => handleChoice('right')}>
            <Text style={styles.choiceButtonText}>Direita</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressText}>Rodada {turnLabel}</Text>
          <Text style={styles.progressText}>Acertos {wins}</Text>
        </View>

        {feedback ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>Prêmio: {feedback.prize}</Text>
            <Text style={styles.feedbackText}>
              {feedback.correct ? 'Correto' : 'Errado'} - {Math.round(feedback.elapsed)}ms
            </Text>
          </View>
        ) : null}

        {timedOut ? (
          <View style={styles.timedOutContainer}>
            <Text style={styles.timedOutText}>Tempo esgotado!</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={resetGame}>
              <Feather name="rotate-cw" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  const renderSettings = () => {
    return (
      <View style={styles.settingsContainer}>
        <Text style={styles.title}>Carga Mental</Text>
        <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
          <Text style={styles.label}>Percentual de 100 à esquerda</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={percentage}
            onChangeText={setPercentage}
            placeholder="0-100"
          />

          <Text style={styles.label}>Rodadas etapa 1</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={rounds1}
            onChangeText={setRounds1}
            placeholder="Ex: 10"
          />

          <Text style={styles.label}>Rodadas etapa 2 (opcional)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={rounds2}
            onChangeText={setRounds2}
            placeholder="0" 
          />

          <Text style={styles.label}>Tempo de referência (segundos)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={limitSeconds}
            onChangeText={setLimitSeconds}
            placeholder="6"
          />

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Feather name="play" size={20} color="#fff" />
            <Text style={styles.startButtonText}>Iniciar jogo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
            <Feather name="home" size={20} color="#fff" />
            <Text style={styles.secondaryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  if (gameOver) {
    return <SafeAreaView style={styles.container}>{renderSummary()}</SafeAreaView>;
  }

  if (!gameStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <Modal visible={showInstructions} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Instruções</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Feather name="x" size={24} color="#d00" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalText}>
                  Bem-vindo ao Carga Mental!{'\n\n'}
                  1. Escolha uma caixinha (esquerda ou direita) e tente encontrar a nota de R$100.{'\n\n'}
                  2. Tente responder antes do tempo limite para pontuar mais.{'\n\n'}
                  3. Caso o tempo termine, você poderá reiniciar o jogo.{'\n\n'}
                </Text>
              </ScrollView>
              <TouchableOpacity style={styles.startButton} onPress={() => setShowInstructions(false)}>
                <Text style={styles.startButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {renderSettings()}
      </SafeAreaView>
    );
  }

  return <SafeAreaView style={styles.container}>{renderGame()}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 18,
  },
  settingsContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    width: '100%',
    height: 44,
    marginTop: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    backgroundColor: '#fff',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a84ff',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 24,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#444',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  gameContainer: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  stageLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a84ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    marginLeft: 6,
    color: '#fff',
    fontWeight: '700',
  },
  instructionsBlock: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  instructionsTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },
  instructionsText: {
    color: '#444',
    lineHeight: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  choiceButton: {
    flex: 1,
    backgroundColor: '#0a84ff',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  choiceButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  progressText: {
    color: '#444',
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  feedbackText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 16,
  },
  timedOutContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  timedOutText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#d00',
    marginBottom: 12,
  },
  summaryContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 18,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  modalBody: {
    marginTop: 12,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
});
