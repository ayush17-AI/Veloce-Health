import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { analyzeBPM } from '../data/medicalData';
import { useState, useEffect } from 'react';
import { supabase, ESP32_USER_ID } from '../supabaseClient';

interface HeartPortalProps {
  bpm: number;
  onBack: () => void;
}

export default function HeartPortal({ bpm, onBack }: HeartPortalProps) {
  const analysis = analyzeBPM(bpm);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('[Veloce] HeartPortal fetch error:', error.message, error.details);
      }

      if (data) {
        setHistory(data.map((item: any) => {
          const dateObj = new Date(item.created_at);
          return {
            date: dateObj.toISOString().split('T')[0],
            time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: `${item.bpm} BPM`,
            status: analyzeBPM(item.bpm).status,
          };
        }));
      }
    };
    fetchHistory();
  }, []);

  let color = '#22C55E';
  let Icon = CheckCircle2;

  if (analysis.status === 'good') {
    color = '#22C55E';
    Icon = CheckCircle2;
  } else if (analysis.status === 'average') {
    color = '#FACC15';
    Icon = AlertCircle;
  } else {
    color = '#EF4444'; // Red for poor
    Icon = ShieldAlert;
  }

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-y-auto overflow-x-hidden pt-12 pb-24"
      initial={{ scale: 0.95, opacity: 0, filter: 'blur(10px)' }}
      animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
      exit={{ scale: 0.95, opacity: 0, filter: 'blur(10px)' }}
      transition={{ type: 'spring', damping: 25, stiffness: 120, mass: 0.8 }}
    >
      {/* Background with blur */}
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: 'url(/heart-bg.png)' }}
      />
      <div className="fixed inset-0 -z-10 bg-white/70 backdrop-blur-md" />

      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-black transition-colors bg-white/50 px-4 py-2 rounded-full border border-white backdrop-blur-md shadow-sm"
        >
          <ArrowLeft size={16} />
          <span className="font-inter text-sm font-semibold">Back to Dashboard</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <p className="text-xs font-inter font-bold text-slate-400 uppercase tracking-[0.25em] mb-2">Cardiovascular Diagnostic Portal</p>
          <h1 className="text-8xl md:text-[120px] font-rajdhani font-bold tracking-tighter leading-none" style={{ color }}>
            {bpm} <span className="text-4xl text-slate-400 tracking-widest font-semibold uppercase relative -top-8 -ml-4">Bpm</span>
          </h1>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Icon size={24} style={{ color }} />
            <span className="text-2xl font-rajdhani font-bold text-slate-800 uppercase tracking-wider">{analysis.status}</span>
          </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/60 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-sm">
            <h3 className="text-[10px] font-inter font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">Current Condition</h3>
            <p className="text-2xl font-rajdhani font-bold text-slate-800 mb-6">{analysis.condition}</p>
            
            <h3 className="text-[10px] font-inter font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Identified Symptoms</h3>
            <ul className="space-y-2">
              {analysis.symptoms.map(sym => (
                <li key={sym} className="flex items-center gap-2 text-slate-600 font-inter text-sm">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {sym}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-sm">
            <h3 className="text-[10px] font-inter font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">Dietary & Medical Guidance</h3>
            <ul className="space-y-4">
              {analysis.diet.map(item => (
                <li key={item} className="p-4 bg-white/50 border border-white rounded-2xl text-slate-700 font-inter text-sm font-medium shadow-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white/60 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-sm max-w-3xl mx-auto">
          <h3 className="text-[10px] font-inter font-bold text-slate-400 uppercase tracking-[0.15em] mb-6">Telemetry History Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter text-sm text-slate-600">
              <thead>
                <tr className="border-b border-white">
                  <th className="py-4 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Date</th>
                  <th className="py-4 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Time</th>
                  <th className="py-4 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">BPM</th>
                  <th className="py-4 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={i} className="border-b border-black/5 hover:bg-white/40 transition-colors">
                    <td className="py-4">{row.date}</td>
                    <td className="py-4">{row.time}</td>
                    <td className="py-4 font-bold text-slate-800">{row.value}</td>
                    <td className="py-4 uppercase text-[10px] tracking-wider font-bold" style={{
                      color: row.status === 'poor' ? '#EF4444' : row.status === 'average' ? '#FACC15' : '#22C55E'
                    }}>{row.status}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan={4} className="py-4 text-center">Loading telemetry...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
