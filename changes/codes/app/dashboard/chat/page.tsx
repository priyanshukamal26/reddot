'use client';

import { motion } from 'motion/react';
import { Edit, Clock, Droplets, Heart, Shield, MessageSquare, Send, Mic } from 'lucide-react';
import { useState } from 'react';

const history = [
  { id: 1, title: 'Cycle Insights', time: '09:15 AM', icon: Clock, active: true },
  { id: 2, title: 'Symptom Check', time: 'Yesterday', icon: Droplets, active: false },
  { id: 3, title: 'Wellness Tips', time: 'Jul 6', icon: Heart, active: false },
  { id: 4, title: 'Data Privacy', time: 'Jul 5', icon: Shield, active: false },
  { id: 5, title: 'RedDot.ai Introduction', time: 'Jul 4', icon: MessageSquare, active: false },
];

const messages = [
  { id: 1, text: 'What menstrual phase am I in today?', sender: 'user' },
  { id: 2, text: 'Based on your logged data and cycle history, you are currently in the Follicular Phase, Day 5. How are your energy levels today?', sender: 'ai' },
  { id: 3, text: 'I feel a bit tired but better than yesterday.', sender: 'user' },
  { id: 4, text: 'That\'s common during this transition. As your estrogen rises, you should see an energy boost in the coming days. Consider lighter activities today. Would you like some nutrition tips for this phase?', sender: 'ai' },
  { id: 5, text: 'Yes, please.', sender: 'user' },
  { id: 6, text: 'Certainly! Focus on iron-rich foods and leafy greens to support your body. Hydration is key. I can also suggest specific recipes if you\'d like.', sender: 'ai' },
];

export default function ChatPage() {
  const [inputText, setInputText] = useState('');

  return (
    <div className="flex h-[calc(100vh-8rem)] -mx-6 -mb-6">
      {/* Sidebar */}
      <div className="w-64 lg:w-80 border-r border-white/5 bg-[rgba(10,10,10,0.5)] backdrop-blur-sm p-4 flex flex-col h-full shrink-0">
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-xl font-medium tracking-tight text-white">Chats</h2>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Edit className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {history.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
                item.active 
                  ? 'bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                  : 'hover:bg-white/5 text-gray-400'
              }`}
            >
              <div className={`p-2 rounded-full ${item.active ? 'bg-white/10' : 'bg-transparent'}`}>
                <item.icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div>
                <h3 className={`text-sm font-medium ${item.active ? 'text-white' : 'text-gray-400'}`}>
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">- {item.time}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e51d38]/5 to-transparent pointer-events-none" />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 flex flex-col z-10">
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="mr-4 flex-shrink-0 pt-2 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#e51d38] shadow-[0_0_12px_rgba(229,29,56,0.8)]" />
                  <div className="w-[1px] h-full bg-gradient-to-b from-[#e51d38]/30 to-transparent mt-2" />
                </div>
              )}
              <div
                className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-md ${
                  msg.sender === 'user'
                    ? 'bg-white/10 border border-white/10 text-white rounded-tr-sm'
                    : 'bg-[#e51d38]/10 border border-[#e51d38]/20 text-gray-200 rounded-tl-sm shadow-[0_4px_20px_rgba(229,29,56,0.05)]'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 pt-2 z-10">
          <div className="max-w-3xl mx-auto relative group">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-[rgba(20,20,22,0.8)] backdrop-blur-xl border border-white/10 focus:border-[#e51d38]/50 rounded-full py-4 pl-6 pr-24 text-sm text-white placeholder-gray-500 outline-none transition-all shadow-lg"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button className="p-2 text-[#e51d38] hover:text-[#ff4d66] transition-colors">
                <Send className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
