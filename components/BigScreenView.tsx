import React, { useEffect, useRef, useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { DEPARTMENT_LABELS, PRIORITY_LABELS } from '../constants';
import { Ticket, TicketStatus } from '../types';
import { ArrowRight, Volume2, VolumeX, Monitor } from 'lucide-react';

export const BigScreenView: React.FC = () => {
  const { lastCalledTicket, tickets } = useQueue();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const previousTicketId = useRef<string | null>(null);
  const isPlayingRef = useRef(false);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Determine history (previous 3 finished or calling tickets excluding current)
  const history = tickets
    .filter(t => (t.status === TicketStatus.CALLING || t.status === TicketStatus.FINISHED) && t.id !== lastCalledTicket?.id)
    .sort((a, b) => (b.calledAt || 0) - (a.calledAt || 0))
    .slice(0, 4);

  // Function to play "Ding Dong" using Web Audio API
  const playChime = () => {
    return new Promise<void>((resolve) => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        resolve();
        return;
      }
      
      const ctx = new AudioContext();
      
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        
        // Envelope for bell sound
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.stop(startTime + duration);
      };

      // Ding (Higher pitch)
      playTone(800, ctx.currentTime, 1.2);
      // Dong (Lower pitch, delayed)
      playTone(600, ctx.currentTime + 0.5, 1.5);
      
      // Resolve after sound finishes roughly
      setTimeout(() => {
        ctx.close();
        resolve();
      }, 2000);
    });
  };

  useEffect(() => {
    if (!lastCalledTicket || !audioEnabled) return;
    
    const handleNewCall = async () => {
       // Prevent overlapping calls logic if needed, though simple async wait is usually enough here
       if (isPlayingRef.current) {
           window.speechSynthesis.cancel();
       }
       isPlayingRef.current = true;

       try {
           // 1. Play Chime
           await playChime();

           // 2. Speak
           // Prioritize the office name if available
           const locationText = lastCalledTicket.officeName || `Consultório do ${lastCalledTicket.doctorName || 'doutor'}`;
           const text = `Senha ${lastCalledTicket.ticketNumber}, ${lastCalledTicket.priority === 'PREFERENTIAL' ? 'preferencial' : ''}. ${lastCalledTicket.patientName}. Comparecer ao ${locationText}.`;
           
           const utterance = new SpeechSynthesisUtterance(text);
           
           // Attempt to find a Portuguese voice
           const ptVoice = voices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt_BR'));
           if (ptVoice) utterance.voice = ptVoice;
           
           utterance.rate = 0.9; 
           utterance.volume = 1;

           utterance.onend = () => {
               isPlayingRef.current = false;
           };
           
           window.speechSynthesis.speak(utterance);

       } catch (error) {
           console.error("Audio playback error", error);
           isPlayingRef.current = false;
       }
    };

    // Check if it's a new ticket or a recall (timestamp update)
    const isNewOrRecall = lastCalledTicket.id !== previousTicketId.current || 
                          (lastCalledTicket.calledAt && (Date.now() - lastCalledTicket.calledAt < 1000));

    if (isNewOrRecall) {
        handleNewCall();
    }
    
    previousTicketId.current = lastCalledTicket.id;

  }, [lastCalledTicket, audioEnabled, voices]);

  if (!audioEnabled) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center text-white z-50 p-4">
        <Monitor size={64} className="mb-6 text-teal-400 animate-bounce" />
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Modo Telão</h1>
        <p className="text-slate-400 mb-8 text-center max-w-md">
          Clique abaixo para iniciar o modo de tela cheia e ativar o áudio das chamadas.
        </p>
        <button 
          onClick={() => {
            setAudioEnabled(true);
            document.documentElement.requestFullscreen().catch(e => console.log(e));
          }}
          className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-full shadow-lg shadow-teal-900/50 text-xl transition transform hover:scale-105 flex items-center gap-3"
        >
          <Volume2 /> Iniciar Sistema
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-100 flex flex-row overflow-hidden font-sans">
      
      {/* Left Side: Main Call */}
      <div className="w-2/3 bg-white flex flex-col justify-center items-center border-r border-slate-200 relative">
        <div className="absolute top-6 left-6 flex gap-2 z-10">
             <span className="px-3 py-1 bg-red-100 text-red-700 rounded font-bold flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> AO VIVO
             </span>
        </div>

        {lastCalledTicket ? (
            /* KEY PROP ADDED HERE: Forces React to destroy and recreate this div, triggering the animation */
            <div 
                key={lastCalledTicket.id + '-' + lastCalledTicket.calledAt} 
                className="flex flex-col items-center text-center w-full px-12 animate-fade-in-up"
            >
                <span className="text-3xl text-slate-500 font-semibold uppercase tracking-widest mb-4 animate-fade-in">Senha Atual</span>
                
                <div className="relative mb-8 flex items-center justify-center">
                     {/* Pulse Ripples Background */}
                    <div className="absolute w-[400px] h-[400px] bg-teal-500/20 rounded-full animate-ripple -z-10"></div>
                    <div className="absolute w-[400px] h-[400px] bg-teal-500/10 rounded-full animate-ripple -z-10" style={{ animationDelay: '0.5s' }}></div>
                    
                    {/* The Number */}
                    <div className="text-[13rem] leading-none font-black text-teal-700 font-mono tracking-tighter z-10 relative animate-heartbeat drop-shadow-2xl">
                        {lastCalledTicket.ticketNumber.toString().padStart(3, '0')}
                    </div>
                    
                    {/* Decorative blob behind (static glow) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-100/50 rounded-full blur-3xl -z-0"></div>
                </div>
                
                <h2 className="text-6xl font-bold text-slate-800 mb-8 line-clamp-2 max-w-4xl animate-fade-in">
                    {lastCalledTicket.patientName}
                </h2>
                
                <div className="flex flex-col items-center gap-4 w-full animate-slide-up-delayed">
                     <div className="bg-slate-900 text-white px-10 py-5 rounded-2xl text-4xl font-bold shadow-2xl w-full max-w-3xl border-2 border-slate-800 transform hover:scale-105 transition-transform">
                        {lastCalledTicket.officeName || DEPARTMENT_LABELS[lastCalledTicket.department]}
                    </div>
                    {lastCalledTicket.priority === 'PREFERENTIAL' && (
                        <div className="bg-amber-500 text-white px-8 py-3 rounded-xl text-2xl font-bold uppercase tracking-wider shadow-lg animate-pulse">
                            Atendimento Preferencial
                        </div>
                    )}
                     <div className="mt-8 text-3xl text-slate-600 font-medium bg-slate-50 px-8 py-4 rounded-xl border border-slate-100">
                        Atendimento com <span className="text-teal-700 font-bold">{lastCalledTicket.doctorName}</span>
                    </div>
                </div>
            </div>
        ) : (
             <div className="flex flex-col items-center text-slate-300 animate-pulse">
                 <div className="text-9xl font-bold mb-4 opacity-20">CLÍNICA</div>
                 <p className="text-2xl">Aguarde ser chamado...</p>
             </div>
        )}

        {/* Footer / Ticker */}
        <div className="absolute bottom-0 w-full bg-teal-800 text-white p-4 overflow-hidden whitespace-nowrap z-20 shadow-lg">
            <div className="animate-marquee inline-block font-medium text-xl">
                Bem-vindo à MINHA RECEPÇÃO. Por favor, aguarde sua senha. Para emergências, dirija-se imediatamente à recepção. Mantenha silêncio na sala de espera.
            </div>
        </div>
      </div>

      {/* Right Side: History */}
      <div className="w-1/3 bg-slate-50 flex flex-col border-l border-slate-200 shadow-xl z-30">
        <div className="bg-slate-800 text-white p-8 text-center shadow-md z-10">
            <h2 className="text-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3">
                <ArrowRight className="text-teal-400" /> Últimas Chamadas
            </h2>
        </div>
        
        <div className="flex-1 p-6 space-y-4 overflow-hidden flex flex-col">
            {history.map((ticket, idx) => (
                <div 
                    key={ticket.id} 
                    className="p-6 rounded-xl border shadow-sm flex justify-between items-center bg-white border-slate-200 transform transition-all duration-500 hover:scale-102"
                    style={{ opacity: 1 - (idx * 0.25) }}
                >
                    <div>
                        <div className="text-5xl font-bold text-slate-700 font-mono mb-2">
                             {ticket.ticketNumber.toString().padStart(3, '0')}
                        </div>
                        <div className="text-sm font-bold text-teal-600 uppercase tracking-wide">
                             {ticket.officeName || DEPARTMENT_LABELS[ticket.department]}
                        </div>
                    </div>
                    <div className="text-right max-w-[50%]">
                        <div className="font-semibold text-slate-800 text-lg truncate">
                            {ticket.patientName}
                        </div>
                         <div className="text-sm text-slate-400 mt-1 flex items-center justify-end gap-1">
                            {new Date(ticket.calledAt || 0).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                </div>
            ))}
            {history.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                    <p>Histórico vazio</p>
                </div>
            )}
        </div>
        
        <button 
            onClick={() => setAudioEnabled(false)}
            className="absolute top-4 right-4 text-slate-300 hover:text-white transition z-50 bg-black/20 p-2 rounded-full"
            title="Silenciar"
        >
            <VolumeX size={20} />
        </button>
      </div>
    </div>
  );
};