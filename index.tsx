
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { Heart, Sparkles, Gift, Send, RefreshCw, ArrowRight } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Services & Logic ---

const RECIPIENT_NAME = "Tanvi";
const SENDER_NAME = "Kuldeep";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const generateTeddyPoem = async (recipient: string, sender: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a very short, sweet, and romantic 4-line poem for Teddy Day from ${sender} to ${recipient}. Make it adorable, heartfelt, and filled with love. Only return the poem text.`,
      config: { temperature: 0.9 },
    });
    return response.text || `To my dearest ${recipient},\nYou're my favorite teddy bear, so soft and sweet,\nHaving you in my life makes it complete.\nLove always, ${sender}`;
  } catch (error) {
    console.error("Poem generation failed:", error);
    return `To my dearest ${recipient},\nYou're cuter than any teddy I've ever seen,\nYou're the heart of my world, my beautiful queen.\nLove always, ${sender}`;
  }
};

const generateCustomTeddyImage = async (style: string): Promise<string | null> => {
  const ai = getAI();
  const prompt = `A highly detailed, ultra-cute teddy bear for Teddy Day. Style: ${style}. The teddy should be holding a heart that says "I Love You ${RECIPIENT_NAME}". Aesthetic, soft lighting, 4k resolution, high quality.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed:", error);
  }
  return null;
};

// --- Components ---

const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<{ id: number; left: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const left = Math.random() * 100;
      const size = Math.random() * (30 - 10) + 10;
      const duration = Math.random() * (10 - 5) + 5;
      setHearts(prev => [...prev, { id, left, size, duration }]);
      setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), duration * 1000);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="heart-particle text-pink-400"
          style={{
            left: `${heart.left}%`,
            fontSize: `${heart.size}px`,
            animationDuration: `${heart.duration}s`,
            bottom: '-50px'
          }}
        >
          ❤️
        </div>
      ))}
    </>
  );
};

const TeddyReveal: React.FC = () => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [poem, setPoem] = useState<string>("");
  const [isGeneratingPoem, setIsGeneratingPoem] = useState(false);
  const [customTeddy, setCustomTeddy] = useState<string | null>(null);
  const [isGeneratingTeddy, setIsGeneratingTeddy] = useState(false);

  useEffect(() => {
    if (isRevealed && !poem) {
      handleGeneratePoem();
    }
  }, [isRevealed]);

  const handleGeneratePoem = async () => {
    setIsGeneratingPoem(true);
    const result = await generateTeddyPoem(RECIPIENT_NAME, SENDER_NAME);
    setPoem(result);
    setIsGeneratingPoem(false);
  };

  const handleGenerateTeddy = async () => {
    setIsGeneratingTeddy(true);
    const result = await generateCustomTeddyImage("Magical Dreamy Pastel Illustration");
    if (result) setCustomTeddy(result);
    setIsGeneratingTeddy(false);
  };

  if (!isRevealed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <div 
          onClick={() => setIsRevealed(true)}
          className="group relative cursor-pointer transform hover:scale-105 transition-all duration-500"
        >
          <div className="absolute -inset-4 bg-pink-200 rounded-full blur-xl opacity-50 group-hover:opacity-75 animate-pulse"></div>
          <div className="relative bg-white p-12 rounded-3xl shadow-2xl border-4 border-pink-100 flex flex-col items-center">
            <Gift className="w-24 h-24 text-pink-500 mb-4 animate-bounce" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">A Surprise for {RECIPIENT_NAME}</h1>
            <p className="text-gray-500">Tap to unbox your Teddy Day gift from {SENDER_NAME}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-cursive text-pink-600 mb-4 drop-shadow-md">
          Happy Teddy Day, {RECIPIENT_NAME}!
        </h1>
        <p className="text-xl text-gray-600 italic">"Just like a teddy, I'm always here to give you the warmest hugs." — Your {SENDER_NAME}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border-t-8 border-pink-400 overflow-hidden relative group">
            <img 
              src={customTeddy || "https://images.unsplash.com/photo-1559440666-339239a3b631?q=80&w=800&auto=format&fit=crop"} 
              alt="Cute Teddy" 
              className="w-full h-auto rounded-2xl transform transition-transform group-hover:scale-105 duration-700"
            />
            
            {/* AI Generator Hint */}
            {!isGeneratingTeddy && (
              <div className="absolute bottom-20 right-4 animate-bounce pointer-events-none z-30">
                <div className="bg-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                  <span>Click for Magic!</span>
                  <ArrowRight className="w-3 h-3 rotate-45" />
                </div>
              </div>
            )}

            {isGeneratingTeddy && (
              <div className="absolute inset-0 bg-white/80 flex flex-center items-center justify-center backdrop-blur-sm z-20">
                <div className="text-center p-4">
                  <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-pink-600 font-semibold">Creating a unique teddy just for {RECIPIENT_NAME}...</p>
                </div>
              </div>
            )}
            
            <button 
              onClick={handleGenerateTeddy}
              disabled={isGeneratingTeddy}
              className="absolute bottom-4 right-4 bg-pink-500 text-white p-4 rounded-full shadow-2xl hover:bg-pink-600 hover:scale-110 active:scale-95 transition-all z-10 group/btn border-2 border-white"
            >
              <Sparkles className="w-7 h-7 group-hover/btn:animate-spin" />
            </button>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-lg border-b-8 border-pink-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
                <Heart className="fill-pink-500 text-pink-500 w-6 h-6" /> A Note for {RECIPIENT_NAME}
              </h3>
              <button 
                onClick={handleGeneratePoem}
                disabled={isGeneratingPoem}
                className="text-pink-400 hover:text-pink-600 p-2 hover:bg-pink-50 rounded-full transition-all"
              >
                <RefreshCw className={`w-5 h-5 ${isGeneratingPoem ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100 relative min-h-[140px] flex items-center justify-center">
              {isGeneratingPoem ? (
                <p className="text-pink-400 animate-pulse italic">{SENDER_NAME} is writing something sweet...</p>
              ) : (
                <p className="text-lg text-gray-800 leading-relaxed font-cursive whitespace-pre-line text-center w-full">
                  {poem}
                </p>
              )}
              <div className="absolute -bottom-2 -right-2 text-4xl">🧸</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-8 rounded-3xl text-white shadow-xl">
            <h2 className="text-3xl font-bold mb-4">Why {RECIPIENT_NAME} is the best:</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="bg-white/20 p-2 rounded-lg">✨</span>
                <span>Your smile lights up {SENDER_NAME}'s world.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-white/20 p-2 rounded-lg">💖</span>
                <span>You're more huggable than any teddy.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-white/20 p-2 rounded-lg">🎀</span>
                <span>You're the most precious gift.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-white/20 p-2 rounded-lg">🧸</span>
                <span>{SENDER_NAME} will always protect you!</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-lg flex items-center justify-between border-l-8 border-pink-500">
            <div className="flex -space-x-3 overflow-hidden">
              <div className="inline-block h-12 w-12 rounded-full ring-2 ring-white bg-pink-200 flex items-center justify-center text-pink-600 font-bold">{SENDER_NAME[0]}</div>
              <div className="inline-block h-12 w-12 rounded-full ring-2 ring-white bg-rose-200 flex items-center justify-center text-rose-600 font-bold">{RECIPIENT_NAME[0]}</div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-500">Our Love Meter</p>
              <p className="text-2xl font-bold text-pink-600 italic">∞ Infinity</p>
            </div>
          </div>

          <div className="bg-pink-100 p-6 rounded-3xl border-2 border-dashed border-pink-300 text-center">
            <p className="text-pink-700 font-semibold mb-2 italic">"A teddy is a gift that says, 'I'm always here for you, {RECIPIENT_NAME}.'"</p>
            <p className="text-xs text-pink-400 uppercase tracking-widest">With Love, {SENDER_NAME}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen relative bg-[#fff5f7] selection:bg-pink-200">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-10 left-10 w-64 h-64 bg-pink-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-100 rounded-full blur-3xl"></div>
      </div>
      <FloatingHearts />
      <main className="relative z-10 py-10">
        <TeddyReveal />
      </main>
      <footer className="relative z-10 pb-10 text-center">
        <p className="text-pink-400 font-medium italic">Handcrafted with ❤️ by {SENDER_NAME} for {RECIPIENT_NAME}</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);

