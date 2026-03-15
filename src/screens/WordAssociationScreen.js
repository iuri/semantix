import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

// Word list from the original application
const SELECT_WORDS = [
  "Cabeça", "Verde", "Água", "Cantar", "Morte", "Grande", "Barco", "Pagar", "Janela", "Querida",
  "Mesa", "Perguntar", "Aldeia", "Frio", "Vara", "Dançar", "Lagoa", "Doente", "Orgulho", "Cozinhar",
  "Tinta", "Mau", "Agulha", "Nadar", "Viagem", "Azul", "Lanterna", "Pecar", "Pão", "Rico",
  "Árvore", "Furar", "Pena", "Amarelo", "Montanha", "Morrer", "Sal", "Novo", "Costume", "Orar",
  "Dinheiro", "Besta", "Caderno", "Desprezar", "Dedo", "Caro", "Pássaro", "Cair", "Livro",
  "Doce", "Preto", "Flor", "Correr", "Rio", "Velho", "Branco", "Casa", "Comer", "Rapaz",
  "Caminho", "Feliz", "Noite", "Cama", "Triste", "Filho", "Escola", "Amigo", "Mulher", "Homem",
  "Coração", "Olho", "Mão", "Pé", "Rosto", "Dente", "Cabelo", "Ouvido", "Nariz", "Boca",
  "Braço", "Perna", "Dedos", "Unha", "Pele", "Sangue", "Ossos", "Carne", "Cérebro", "Pulmão",
  "Fígado", "Rim", "Estômago", "Intestino", "Coração", "Artéria", "Veia", "Nervo", "Músculo", "Tendão"
];

const MAX_WORDS = 10; // Reduced for mobile experience

export default function WordAssociationGame() {
  const navigation = useNavigation();
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [results, setResults] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [error, setError] = useState('');
  const [gameFinished, setGameFinished] = useState(false);

  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get a new random word
  const getNewWord = () => {
    const shuffled = shuffleArray(SELECT_WORDS);
    const randomIndex = Math.floor(Math.random() * shuffled.length);
    return shuffled[randomIndex].toLowerCase();
  };

  // Start the game
  const startGame = () => {
    setShowInstructions(false);
    const newWord = getNewWord();
    setCurrentWord(newWord);
    setStartTime(new Date());
  };

  const closeGame = () => {
    setShowInstructions(false);
  };

  // Handle word submission
  const submitWord = () => {
    if (!userInput.trim()) {
      setError('Digite uma palavra.');
      return;
    }

    const endTime = new Date();
    const responseTime = endTime - startTime;

    const result = {
      id: wordCount + 1,
      probeWord: currentWord,
      responseWord: userInput.toLowerCase().trim(),
      responseTime: responseTime,
      date: new Date().toLocaleDateString(),
      similarity: Math.random() // Placeholder - would need backend for real similarity
    };

    setResults(prev => [...prev, result]);
    setUserInput('');
    setError('');
    setWordCount(prev => prev + 1);

    if (wordCount + 1 >= MAX_WORDS) {
      setGameFinished(true);
    } else {
      const newWord = getNewWord();
      setCurrentWord(newWord);
      setStartTime(new Date());
    }
  };

  // Skip current word
  const skipWord = () => {
    const endTime = new Date();
    const responseTime = endTime - startTime;

    const result = {
      id: wordCount + 1,
      probeWord: currentWord,
      responseWord: 'NaN',
      responseTime: responseTime,
      date: new Date().toLocaleDateString(),
      similarity: 0
    };

    setResults(prev => [...prev, result]);
    setWordCount(prev => prev + 1);

    if (wordCount + 1 >= MAX_WORDS) {
      setGameFinished(true);
    } else {
      const newWord = getNewWord();
      setCurrentWord(newWord);
      setStartTime(new Date());
    }
  };

  if (gameFinished) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.finishedContainer}>
          <Text style={styles.finishedTitle}>Teste Concluído!</Text>
          <Text style={styles.finishedText}>
            Você completou o teste de associação de palavras.
          </Text>
          <ScrollView style={styles.resultsScroll}>
            <Text style={styles.resultsTitle}>Resultados:</Text>
            {results.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultText}>
                  <Text style={styles.resultLabel}>Palavra Sonda: </Text>
                  {result.probeWord}
                </Text>
                <Text style={styles.resultText}>
                  <Text style={styles.resultLabel}>Resposta: </Text>
                  {result.responseWord}
                </Text>
                <Text style={styles.resultText}>
                  <Text style={styles.resultLabel}>Tempo: </Text>
                  {result.responseTime}ms
                </Text>
                <Text style={styles.resultText}>
                  <Text style={styles.resultLabel}>Similaridade: </Text>
                  {result.similarity.toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="home" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Voltar ao Início</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        
            <Text style={styles.modalTitle}>AssociaPalavra</Text>
            <ScrollView style={styles.instructionsScroll}>  
              <Text style={styles.instructionsText}>
                Este é um teste de associação de palavras.{'\n\n'}
                Serão apresentadas palavras na tela que chamaremos de 'Palavras Sonda'.{'\n\n'}
                A cada 'Palavra Sonda' apresentada, você deve ler e então escrever na caixa de texto a primeira palavra que lhe vier à mente e clicar no botão 'Enviar' ou apertar 'Enter'.{'\n\n'}
                Caso deseje, você pode pular palavras apertando o botão 'Pular', embora isso não seja recomendado e deva ser usado como última opção!{'\n\n'}
                POR FAVOR, RELEIA AS INSTRUÇÕES E APERTE EM COMEÇAR APENAS QUANDO SE SENTIR CONFIANTE DE QUE ESTÁ PREPARADO!
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startButtonText}>Começar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {!showInstructions && (
        <View style={styles.gameContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
              <Feather name="x" size={24} color="#d00" />
            </TouchableOpacity>
            <Text style={styles.progressText}>Palavra {wordCount + 1} de {MAX_WORDS}</Text>
          </View>

          <View style={styles.wordContainer}>
            <Text style={styles.probeWord}>{currentWord}</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Digite a palavra"
              value={userInput}
              onChangeText={(text) => {
                setUserInput(text);
                if (error) setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={submitWord}
              returnKeyType="send"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.skipButton} onPress={skipWord}>
              <Text style={styles.skipButtonText}>Pular</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, !userInput.trim() && styles.submitButtonDisabled]}
              onPress={submitWord}
              disabled={!userInput.trim()}
            >
              <Text style={styles.submitButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  instructionsScroll: {
    maxHeight: 300,
  },
  instructionsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'justify',
  },
  startButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  closeButton: {
    padding: 8,
  },
  progressText: {
    fontSize: 18,
    color: '#666',
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  probeWord: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 30,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#d00',
    marginTop: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButton: {
    backgroundColor: '#ffc107',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finishedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  finishedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 20,
    textAlign: 'center',
  },
  finishedText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  resultsScroll: {
    flex: 1,
    width: '100%',
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  resultLabel: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  backButton: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    flexDirection: 'row',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});