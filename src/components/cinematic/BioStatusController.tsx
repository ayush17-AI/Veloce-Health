import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import SeeSawPhysicsSystem from './SeeSawPhysicsSystem';
import HeartPortal from '../../pages/HeartPortal';
import TempPortal from '../../pages/TempPortal';
import { Heart, Activity, Radio, Wifi, WifiOff } from 'lucide-react';
import { supabase, ESP32_USER_ID } from '../../supabaseClient';

export default function BioStatusController() {
  const [bpm, setBpm] = useState(72);
  const [temp, setTemp] = useState(98.6);
  const [activePortal, setActivePortal] = useState<'heart' | 'temp' | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Shared fetch function (used by both initial load & polling fallback) ──
  const fetchLatest = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', ESP32_USER_ID)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('[Veloce] Fetch error:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const row = data[0];
        if (row.bpm != null) setBpm(row.bpm);
        if (row.temperature != null) setTemp(row.temperature);
        console.log('[Veloce] Fetched latest:', { bpm: row.bpm, temp: row.temperature });
      }
    } catch (err) {
      console.error('[Veloce] Fetch exception:', err);
    }
  }, []);

  // ── Start polling fallback (5s interval) ──
  const startPolling = useCallback(() => {
    if (pollingRef.current) return; // already polling
    console.log('[Veloce] Starting polling fallback (5s interval)');
    pollingRef.current = setInterval(fetchLatest, 5000);
  }, [fetchLatest]);

  // ── Stop polling ──
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      console.log('[Veloce] Stopping polling fallback');
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Fetch initial data immediately
    fetchLatest();

    // ── Subscribe to realtime INSERT events ──
    const channel = supabase
      .channel('health_metrics_realtime', {
        config: { broadcast: { self: true } },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_metrics',
          filter: `user_id=eq.${ESP32_USER_ID}`,
        },
        (payload) => {
          console.log('[Veloce] Realtime INSERT received:', payload.new);
          const row = payload.new as { bpm?: number; temperature?: number };

          if (row.bpm != null) setBpm(row.bpm);
          if (row.temperature != null) setTemp(row.temperature);

          setIsLive(true);
          setTimeout(() => setIsLive(false), 2000);
        }
      )
      .subscribe((status, err) => {
        console.log('[Veloce] Channel status:', status, err || '');

        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          console.log('[Veloce] ✅ Realtime connected — listening for INSERT events');
          stopPolling(); // Websocket is healthy, no need to poll
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionStatus('disconnected');
          console.warn('[Veloce] ⚠️ Realtime error — activating polling fallback');
          startPolling();
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected');
          console.warn('[Veloce] Realtime channel closed — activating polling fallback');
          startPolling();
        }
      });

    channelRef.current = channel;

    // ── Safety net: if still not connected after 8s, start polling ──
    const safetyTimeout = setTimeout(() => {
      if (connectionStatus === 'connecting') {
        console.warn('[Veloce] Connection timeout — activating polling fallback');
        setConnectionStatus('disconnected');
        startPolling();
      }
    }, 8000);

    return () => {
      clearTimeout(safetyTimeout);
      stopPolling();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heartStatus = bpm < 55 || bpm > 110 ? 'poor' : bpm < 60 || bpm > 100 ? 'average' : 'good';
  const tempStatus = temp > 102 || temp < 96 ? 'danger' : temp > 99.5 || temp < 97 ? 'warning' : 'normal';

  const handleHeartClick = () => setActivePortal('heart');
  const handleTempClick = () => setActivePortal('temp');
  const handleBack = () => setActivePortal(null);

  const ConnectionIcon = connectionStatus === 'connected' ? Wifi : WifiOff;
  const connectionColor = connectionStatus === 'connected' ? 'text-green-400' : connectionStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400';

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
            {/* Connection status indicator */}
            <div className={`flex items-center gap-1 ${connectionColor}`} title={`Status: ${connectionStatus}`}>
              <ConnectionIcon size={10} />
              {connectionStatus === 'disconnected' && (
                <span className="text-[8px] font-inter uppercase tracking-wider text-red-400 font-bold">Poll</span>
              )}
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
