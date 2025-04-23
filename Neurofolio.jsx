// components/NeuroFolio.jsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from 'next-themes';
import { Moon, Sun, Mic, Image as ImageIcon, UserCircle, Trash2, Save, Upload } from 'lucide-react';

export default function NeuroFolio() {
  const [projectText, setProjectText] = useState('');
  const [summary, setSummary] = useState('');
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const { theme, setTheme } = useTheme();
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en');
  const [model, setModel] = useState('groq-llama3');
  const [persona, setPersona] = useState('friendly');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Initialize speech recognition with browser compatibility check
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.lang = language;
        recog.continuous = false;
        recog.interimResults = false;
        recog.onresult = (event) => {
          setChatMessage(event.results[0][0].transcript);
          setIsListening(false);
        };
        recog.onend = () => {
          setIsListening(false);
        };
        recog.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          setErrorMessage('Speech recognition failed. Please try again or type your message.');
        };
        setRecognition(recog);
      }
    }
  }, [language]);

  const handleSummarize = async () => {
    if (!projectText.trim()) {
      setErrorMessage('Please enter some text to summarize');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: projectText, model }),
      });
      
      if (!res.ok) {
        throw new Error(`Summarize API error: ${res.status}`);
      }

      const data = await res.json();
      if (!data.summary) {
        throw new Error('Invalid response: summary not found');
      }

      setSummary(data.summary);
      setTranslatedSummary('');
    } catch (error) {
      console.error('Error during summarization:', error);
      setErrorMessage('Sorry, something went wrong while generating the summary.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslateSummary = async () => {
    if (!summary) {
      setErrorMessage('Please generate a summary first');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summary, targetLanguage: language }),
      });
      
      if (!res.ok) {
        throw new Error(`Translation API error: ${res.status}`);
      }
      
      const data = await res.json();
      if (!data.translated) {
        throw new Error('Invalid response: translated text not found');
      }
      
      setTranslatedSummary(data.translated);
    } catch (error) {
      console.error('Error during translation:', error);
      setErrorMessage('Sorry, something went wrong while translating the summary.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    // Add user message immediately for better UX
    const updatedChatLog = [...chatLog, { role: 'user', text: chatMessage }];
    setChatLog(updatedChatLog);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: chatMessage, model, language, persona }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      if (!data.reply) {
        throw new Error('Invalid response from AI');
      }

      setChatLog([...updatedChatLog, { role: 'ai', text: data.reply }]);
      setChatMessage('');
    } catch (error) {
      console.error('Chat API error:', error);
      setChatLog([...updatedChatLog, { role: 'ai', text: 'Sorry, something went wrong. Please try again.' }]);
      setErrorMessage('Failed to get response from AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    const element = document.getElementById('summary-section');
    if (!element) {
      setErrorMessage('Nothing to export');
      return;
    }
    
    try {
      // Dynamic import of html2pdf.js
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      
      html2pdf().from(element).save('neurofolio-summary.pdf');
    } catch (error) {
      console.error('PDF export error:', error);
      setErrorMessage('Failed to export PDF. Make sure html2pdf.js is installed.');
    }
  };

  const handleSaveChat = () => {
    if (chatLog.length === 0) {
      setErrorMessage('No chat history to save');
      return;
    }
    
    try {
      const blob = new Blob([JSON.stringify(chatLog, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'chat-log.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Save chat error:', error);
      setErrorMessage('Failed to save chat history');
    }
  };

  const handleLoadChat = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json') {
      setErrorMessage('Please upload a JSON file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedChat = JSON.parse(event.target.result);
        if (Array.isArray(loadedChat)) {
          setChatLog(loadedChat);
          setErrorMessage('');
        } else {
          throw new Error('Invalid chat format');
        }
      } catch (error) {
        console.error('Parse chat JSON error:', error);
        setErrorMessage('Invalid chat file format');
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the file');
    };
    reader.readAsText(file);
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      setErrorMessage('Speech recognition is not supported in your browser');
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setErrorMessage('');
      recognition.start();
      setIsListening(true);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file');
      return;
    }
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setIsLoading(true);
    setErrorMessage('');
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await fetch('/api/image-analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Image analysis API error: ${res.status}`);
      }

      const data = await res.json();
      if (!data.description) {
        throw new Error('Invalid response: description not found');
      }

      setChatLog([...chatLog, { role: 'ai', text: data.description }]);
    } catch (error) {
      console.error('Image analysis error:', error);
      setChatLog([...chatLog, { role: 'ai', text: 'Sorry, image analysis failed. Please try again.' }]);
      setErrorMessage('Image analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatLog([]);
    setErrorMessage('');
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">NeuroFolio</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:text-red-100">
          {errorMessage}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Project Text</h2>
              <Textarea
                placeholder="Enter your project text here..."
                value={projectText}
                onChange={(e) => setProjectText(e.target.value)}
                rows={6}
                className="w-full"
              />
            </div>
            
            <div className="flex justify-between">
              <div className="flex gap-2">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="px-3 py-2 border rounded"
                >
                  <option value="groq-llama3">Llama 3</option>
                  <option value="openai-gpt4">GPT-4</option>
                  <option value="anthropic-claude">Claude</option>
                </select>
                
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 border rounded"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
              
              <Button 
                onClick={handleSummarize} 
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Summarize'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <Card id="summary-section">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Summary</h2>
                <div className="border p-4 rounded bg-gray-50 dark:bg-gray-800">
                  {summary}
                </div>
              </div>
              
              {translatedSummary && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Translated Summary</h3>
                  <div className="border p-4 rounded bg-gray-50 dark:bg-gray-800">
                    {translatedSummary}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button 
                  onClick={handleTranslateSummary} 
                  disabled={isLoading || !summary}
                >
                  Translate
                </Button>
                <Button 
                  onClick={handleExport} 
                  disabled={!summary}
                >
                  Export as PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">Chat Assistant</h2>
            
            <div className="border p-4 rounded h-64 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-800">
              {chatLog.length === 0 ? (
                <p className="text-gray-500 text-center">Start a conversation...</p>
              ) : (
                chatLog.map((chat, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded max-w-[80%] ${
                      chat.role === 'user' 
                        ? 'ml-auto bg-blue-100 dark:bg-blue-900' 
                        : 'mr-auto bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {chat.role === 'user' ? (
                        <UserCircle size={16} />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-purple-500" />
                      )}
                      <span className="text-xs font-semibold">
                        {chat.role === 'user' ? 'You' : 'AI'}
                      </span>
                    </div>
                    <p>{chat.text}</p>
                  </div>
                ))
              )}
            </div>
            
            {imagePreview && (
              <div className="border p-2 rounded">
                <img 
                  src={imagePreview} 
                  alt="Uploaded" 
                  className="max-h-32 max-w-full mx-auto" 
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                className="flex-1"
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleVoiceInput}
                className={isListening ? 'bg-red-100 dark:bg-red-900' : ''}
              >
                <Mic size={20} />
              </Button>
              
              <label htmlFor="image-upload">
                <Button variant="outline" size="icon" as="span">
                  <ImageIcon size={20} />
                </Button>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <Button onClick={handleChat} disabled={!chatMessage.trim() && !imageFile}>
                Send
              </Button>
            </div>
            
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearChat}
                >
                  <Trash2 size={16} className="mr-1" /> Clear
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSaveChat}
                  disabled={chatLog.length === 0}
                >
                  <Save size={16} className="mr-1" /> Save
                </Button>
                
                <label htmlFor="chat-upload">
                  <Button variant="outline" size="sm" as="span">
                    <Upload size={16} className="mr-1" /> Load
                  </Button>
                </label>
                <input
                  id="chat-upload"
                  type="file"
                  accept="application/json"
                  onChange={handleLoadChat}
                  className="hidden"
                />
              </div>
              
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                className="px-2 py-1 text-sm border rounded"
              >
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="concise">Concise</option>
                <option value="creative">Creative</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}