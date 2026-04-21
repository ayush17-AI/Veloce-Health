import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import SeeSawPhysicsSystem from './SeeSawPhysicsSystem';
import HeartPortal from '../../pages/HeartPortal';
import TempPortal from '../../pages/TempPortal';
import { Heart, Activity, Radio } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function BioStatusController() {
  const [bpm, setBpm] = useState(72);
  const [temp, setTemp] = useState(98.6);
  const [activePortal, setActivePortal] = useState<'heart' | 'temp' | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Fetch initial data
    const fetchLatest = async () => {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (!error && data && data.length > 0) {
        setBpm(data[0].bpm);
        setTemp(data[0].temperature);
      }
    };
    
    fetchLatest();

    // TEMPORARY OVERRIDE: Listen only to specific ESP32 data
    const USER_UID = "72c219a2-a11e-48be-bb96-8b20614fe009";

    // Subscribe to realtime changes
    const channel = supabase
      .channel('health_metrics_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_metrics',
          filter: 'user_id=eq.' + USER_UID
        },
        (payload) => {
          setIsLive(true);
          if (payload.new.bpm) setBpm(payload.new.bpm);
          if (payload.new.temperature) setTemp(payload.new.temperature);
          
          // Reset live pulse indicator
          setTimeout(() => setIsLive(false), 2000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const heartStatus = bpm < 55 || bpm > 110 ? 'poor' : bpm < 60 || bpm > 100 ? 'average' : 'good';
  const tempStatus = temp > 102 || temp < 96 ? 'danger' : temp > 99.5 || temp < 97 ? 'warning' : 'normal';

  const handleHeartClick = () => setActivePortal('heart');
  const handleTempClick = () => setActivePortal('temp');
  const handleBack = () => setActivePortal(null);

  return (
    <div className="relative w-full overflow-visible">
      {/* 3D Scene Centerpiece */}
      <SeeSawPhysicsSystem 
        bpm={bpm} 
        temperature={temp} 
        heartStatus={heartStatus} 
        tempStatus={tempStatus} 
        onHeartClick={handleHeartClick}
        onTempClick={handleTempClick}
      />

      {/* Live Telemetry Feed Dashboard - Hide if a portal is active */}
      {!activePortal && (
        <div className="absolute top-10 left-10 md:left-24 glass-panel-dark p-5 rounded-2xl flex flex-col gap-5 z-50 shadow-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-inter uppercase text-white/50 tracking-[0.2em] font-bold">Telemetry Feed</p>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded border border-red-500/20">
              <Radio size={10} className={`text-red-500 ${isLive ? 'animate-pulse' : ''}`} />
              <span className="text-[9px] font-inter uppercase tracking-wider text-red-500 font-bold">
                {isLive ? 'Receiving' : 'Live'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 w-48">
            <div className="flex justify-between items-center text-sm font-rajdhani text-white">
              <span className="flex items-center gap-2"><Heart size={14} color="#EF4444" /> Pulse (BPM)</span>
              <span className="font-bold text-lg">{bpm}</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded overflow-hidden">
               <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, ((bpm - 40) / 90) * 100))}%` }} />
            </div>
          </div>

          <div className="flex flex-col gap-2 w-48">
            <div className="flex justify-between items-center text-sm font-rajdhani text-white">
              <span className="flex items-center gap-2"><Activity size={14} color="#22C55E" /> Temp (°F)</span>
              <span className="font-bold text-lg">{temp.toFixed(1)}</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded overflow-hidden">
               <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, ((temp - 94) / 12) * 100))}%` }} />
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {activePortal === 'heart' && (
          <HeartPortal key="heart-portal" bpm={bpm} onBack={handleBack} />
        )}
        {activePortal === 'temp' && (
          <TempPortal key="temp-portal" temperature={temp} onBack={handleBack} />
        )}
      </AnimatePresence>
    </div>
  );
}
