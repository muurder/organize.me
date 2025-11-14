
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getBotResponse } from './services/geminiService';
import { SYSTEM_PROMPT, INITIAL_CONTEXT } from './constants';
import type { ChatMessage, InputPayload, OutputPayload, DadosContexto } from './types';
import ChatBubble from './components/ChatBubble';
import JsonDisplay from './components/JsonDisplay';

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentUserMessage, setCurrentUserMessage] = useState<string>('');
  const [currentState, setCurrentState] = useState<string | null>(null);
  const [contextData, setContextData] = useState<DadosContexto>(INITIAL_CONTEXT);
  const [lastApiResponse, setLastApiResponse] = useState<OutputPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = useCallback(async () => {
    if (!currentUserMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: currentUserMessage };
    setChatHistory(prev => [...prev, userMessage]);
    setCurrentUserMessage('');
    setIsLoading(true);
    setError(null);

    const inputPayload: InputPayload = {
      mensagem_usuario: currentUserMessage,
      estado_atual: currentState,
      dados_contexto: contextData,
    };

    try {
      const fullPrompt = `${SYSTEM_PROMPT}\n\nINPUT:\n${JSON.stringify(inputPayload, null, 2)}`;
      const botResponse = await getBotResponse(fullPrompt);

      if (botResponse) {
        setLastApiResponse(botResponse);
        const botMessage: ChatMessage = { sender: 'bot', text: botResponse.resposta_usuario };
        setChatHistory(prev => [...prev, botMessage]);
        setCurrentState(botResponse.proximo_estado);
        // Ensure we keep the phone number from the original context
        setContextData({
          ...botResponse.atualizar_contexto,
          telefone: contextData.telefone
        });
      } else {
        throw new Error('Received an empty response from the API.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      const errorBotMessage: ChatMessage = { sender: 'bot', text: `Desculpe, ocorreu um erro: ${errorMessage}` };
      setChatHistory(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserMessage, isLoading, currentState, contextData]);

  const handlePresetMessage = (message: string) => {
    setCurrentUserMessage(message);
  };
  
  const handleReset = () => {
    setChatHistory([]);
    setCurrentUserMessage('');
    setCurrentState(null);
    setContextData(INITIAL_CONTEXT);
    setLastApiResponse(null);
    setIsLoading(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-900 text-gray-200 p-2 md:p-4">
      <header className="text-center mb-4 p-4 border-b border-gray-700">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-400">WhatsApp Scheduling Assistant Simulator</h1>
        <p className="text-gray-400 mt-1">An interactive simulator for a Gemini-powered scheduling assistant.</p>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-120px)]">
        {/* Left Column: Chat Interface */}
        <div className="flex flex-col bg-gray-800 rounded-lg shadow-xl h-full">
          <div className="flex-grow p-4 overflow-y-auto">
            {chatHistory.map((msg, index) => (
              <ChatBubble key={index} message={msg} />
            ))}
            {isLoading && <ChatBubble message={{ sender: 'bot', text: 'Pensando...' }} isLoading={true} />}
            <div ref={chatEndRef} />
          </div>

          <div className="p-2 border-t border-gray-700 space-x-2 flex justify-center">
             <button onClick={() => handlePresetMessage('oi')} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">oi</button>
             <button onClick={() => handlePresetMessage('1')} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">1</button>
             <button onClick={() => handlePresetMessage('Corte')} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">Corte</button>
             <button onClick={() => handlePresetMessage('amanhã')} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">amanhã</button>
             <button onClick={() => handlePresetMessage('16:00')} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">16:00</button>
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center bg-gray-700 rounded-lg">
              <input
                type="text"
                value={currentUserMessage}
                onChange={(e) => setCurrentUserMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                className="w-full bg-transparent p-3 focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !currentUserMessage.trim()}
                className="p-3 text-cyan-400 hover:text-cyan-300 disabled:text-gray-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
             {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
          </div>
        </div>

        {/* Right Column: State & Response */}
        <div className="flex flex-col gap-4 h-full">
            <div className="bg-gray-800 rounded-lg shadow-xl p-4 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-cyan-400">Current State & Context</h2>
                    <button onClick={handleReset} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 rounded-full transition-colors">Reset</button>
                </div>
                <JsonDisplay data={{ estado_atual: currentState, dados_contexto: contextData }} />
            </div>
            <div className="bg-gray-800 rounded-lg shadow-xl p-4 flex-1 overflow-y-auto">
                <h2 className="text-xl font-semibold text-cyan-400 mb-2">Last API Response</h2>
                <JsonDisplay data={lastApiResponse || { message: "No response yet." }} />
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
