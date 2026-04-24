import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import SeeSawPhysicsSystem from './SeeSawPhysicsSystem';
import HeartPortal from '../../pages/HeartPortal';
import TempPortal from '../../pages/TempPortal';
import { Heart, Activity, Radio, Wifi, WifiOff, Clock } from 'lucide-react';
import { supabase } from '../../supabaseClient';

// Convert Celsius to Fahrenheit for the see-saw physics (expects °F range 95–105)
const cToF = (c: number) => c * 9 / 5 + 32;

export default function BioStatusController() {
  const [bpm, setBpm] = useState(72);
  // Temperature stored in °C — default 37°C shown until first live Supabase data arrives
  const [temp, setTemp] = useState(37);
  const [activePortal, setActivePortal] = useState<'heart' | 'temp' | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const connectionStatusRef = useRef(connectionStatus);

  useEffect(() => {
    connectionStatusRef.current = connectionStatus;
  }, [connectionStatus]);

  // ── Helper: apply a data row to state ──
  const applyRow = useCallback((row: { bpm?: number; temperature?: number }) => {
    if (row.bpm != null) setBpm(row.bpm);
    if (row.temperature != null) setTemp(row.temperature);
    setLastUpdated(new Date()); // Always use LOCAL browser time
  }, []);

  // ── Fetch the absolute latest row — no date filter, no user_id filter ──
  // Just gets the most recent row by created_at, period.
  const fetchLatest = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('[Veloce] Fetch error:', error.message, error.details, error.hint);
        return false;
      }

      if (data && data.length > 0) {
        const row = data[0];
        applyRow(row);
        console.log('[Veloce] ✅ Fetched latest row:', {
          bpm: row.bpm,
          temp: row.temperature,
          db_created_at: row.created_at,
          local_time: new Date().toLocaleTimeString(),
        });
        return true;
      } else {
        console.warn('[Veloce] ⚠️ Table returned 0 rows — either empty or RLS is blocking.');
        return false;
      }
    } catch (err) {
      console.error('[Veloce] Fetch exception:', err);
      return false;
    }
  }, [applyRow]);

  // ── Polling wrapper — updates connection status on success ──
  const pollAndUpdateStatus = useCallback(async () => {
    const success = await fetchLatest();
    if (success) {
      setConnectionStatus('connected');
      setIsLive(true);
      setTimeout(() => setIsLive(false), 2000);
    }
  }, [fetchLatest]);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    console.log('[Veloce] 🔄 Starting 5s polling fallback');
    pollAndUpdateStatus();
    pollingRef.current = setInterval(pollAndUpdateStatus, 5000);
  }, [pollAndUpdateStatus]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchLatest();

    // ── Realtime subscription — no filters, catch every INSERT ──
    const channel = supabase
      .channel('health_metrics_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_metrics',
        },
        (payload) => {
          console.log('[Veloce] 🔔 Realtime INSERT:', payload.new);
          applyRow(payload.new as { bpm?: number; temperature?: number });
          setConnectionStatus('connected');
          setIsLive(true);
          setTimeout(() => setIsLive(false), 2000);
        }
      )
      .subscribe((status, err) => {
        console.log('[Veloce] Channel:', status, err ? `(${err})` : '');

        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          stopPolling();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setConnectionStatus('disconnected');
          startPolling();
        }
      });

    channelRef.current = channel;

    // Safety net
    const safetyTimeout = setTimeout(() => {
      if (connectionStatusRef.current === 'connecting') {
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

  // ── Format "Last Updated" as local browser time ──
  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  const heartStatus = bpm < 55 || bpm > 110 ? 'poor' : bpm < 60 || bpm > 100 ? 'average' : 'good';
  const tempStatus = temp > 38.9 || temp < 35.6 ? 'danger' : temp > 37.5 || temp < 36.1 ? 'warning' : 'normal';

  const handleHeartClick = () => setActivePortal('heart');
  const handleTempClick = () => setActivePortal('temp');
  const handleBack = () => setActivePortal(null);

  const ConnectionIcon = connectionStatus === 'connected' ? Wifi : WifiOff;
  const connectionColor = connectionStatus === 'connected'
    ? 'text-green-400'
    : connectionStatus === 'connecting'
      ? 'text-yellow-400 animate-pulse'
      : 'text-red-400';

  return (
    <div className="relative w-full overflow-visible">
      <SeeSawPhysicsSystem 
        bpm={bpm} 
        temperature={cToF(temp)} 
        heartStatus={heartStatus} 
        tempStatus={tempStatus} 
        onHeartClick={handleHeartClick}
        onTempClick={handleTempClick}
      />

      {/* Live Telemetry Feed Dashboard */}
      {!activePortal && (
        <div className="absolute top-10 left-10 md:left-24 glass-panel-dark p-5 rounded-2xl flex flex-col gap-5 z-50 shadow-2xl border border-white/5">
          {/* Header row */}
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-inter uppercase text-white/50 tracking-[0.2em] font-bold">Telemetry Feed</p>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded border border-red-500/20">
              <Radio size={10} className={`text-red-500 ${isLive ? 'animate-pulse' : ''}`} />
              <span className="text-[9px] font-inter uppercase tracking-wider text-red-500 font-bold">
                {isLive ? 'Receiving' : 'Live'}
              </span>
            </div>
            <div className={`flex items-center gap-1 ${connectionColor}`} title={`Connection: ${connectionStatus}`}>
              <ConnectionIcon size={10} />
              <span className="text-[8px] font-inter uppercase tracking-wider font-bold">
                {connectionStatus === 'connected' ? 'OK' : connectionStatus === 'connecting' ? '...' : 'Poll'}
              </span>
            </div>
          </div>

          {/* Last Updated — always local browser time */}
          <div className="flex items-center gap-1.5 -mt-3">
            <Clock size={9} className="text-white/30" />
            <span className="text-[9px] font-inter text-white/30 tracking-wide">
              Last updated: {lastUpdatedStr}
            </span>
          </div>
          
          {/* BPM */}
          <div className="flex flex-col gap-2 w-48">
            <div className="flex justify-between items-center text-sm font-rajdhani text-white">
              <span className="flex items-center gap-2"><Heart size={14} color="#EF4444" /> Pulse (BPM)</span>
              <span className="font-bold text-lg">{bpm}</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded overflow-hidden">
               <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, ((bpm - 40) / 90) * 100))}%` }} />
            </div>
          </div>

          {/* Temperature */}
          <div className="flex flex-col gap-2 w-48">
            <div className="flex justify-between items-center text-sm font-rajdhani text-white">
              <span className="flex items-center gap-2"><Activity size={14} color="#22C55E" /> Temp (°C)</span>
              <span className="font-bold text-lg">{temp.toFixed(1)}</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded overflow-hidden">
               <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, ((temp - 34.4) / 6.7) * 100))}%` }} />
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
