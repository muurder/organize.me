
import React from 'react';
import type { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
  isLoading?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isLoading = false }) => {
  const isUser = message.sender === 'user';
  
  const bubbleClasses = isUser
    ? 'bg-cyan-600 text-white self-end'
    : 'bg-gray-700 text-gray-200 self-start';
  
  const containerClasses = isUser
    ? 'flex justify-end'
    : 'flex justify-start';

  // Function to format the text with line breaks
  const formatText = (text: string) => {
    return text.split('\n').map((line, index, array) => (
      <React.Fragment key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className={`mb-4 ${containerClasses}`}>
      <div className={`max-w-md md:max-w-lg lg:max-w-xl rounded-lg p-3 shadow-md ${bubbleClasses}`}>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{formatText(message.text)}</p>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
