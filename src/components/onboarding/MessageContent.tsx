
import React from 'react';

interface MessageContentProps {
  content: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  // Parse markdown-style bold text (**text**)
  const parseContent = (text: string) => {
    const parts = text.split('**');
    const elements: (string | JSX.Element)[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text
        if (parts[i]) {
          elements.push(parts[i]);
        }
      } else {
        // Bold text
        if (parts[i]) {
          elements.push(
            <strong key={i} className="font-semibold">
              {parts[i]}
            </strong>
          );
        }
      }
    }
    
    return elements;
  };

  return (
    <span className="whitespace-pre-wrap">
      {parseContent(content)}
    </span>
  );
};

export default MessageContent;
