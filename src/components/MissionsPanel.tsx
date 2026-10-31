import React from 'react';
import { Mission } from '../types/blockchain';
import { CheckCircle2, Circle, ArrowRight, Sparkles, Award } from 'lucide-react';

interface MissionsPanelProps {
  missions: Mission[];
  onTriggerMissionAction: (missionId: string) => void;
}

export const MissionsPanel: React.FC<MissionsPanelProps> = ({
  missions,
  onTriggerMissionAction,
}) => {
  const completedCount = missions.filter((m) => m.completed).length;
  const progressPercent = Math.round((completedCount / missions.length) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Lern-Missionen: Schritt für Schritt verstehen</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Löse die 4 Schul-Missionen, um das Prinzip von Mining, Blockchain und Fälschungssicherheit zu meistern!
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 tabular-nums">
              {completedCount} von {missions.length}
            </span>
            <span className="text-[10px] text-slate-500 block">Missionen gelöst</span>
          </div>
          <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mission Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {missions.map((mission, idx) => (
          <div
            key={mission.id}
            className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between ${
              mission.completed
                ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  {mission.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span className={mission.completed ? 'text-emerald-900' : 'text-slate-900'}>
                    {mission.title}
                  </span>
                </span>
                {mission.completed && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Erledigt!
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                {mission.description}
              </p>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic">
                💡 Tipp: {mission.hint}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-end">
              <button
                type="button"
                onClick={() => onTriggerMissionAction(mission.id)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  mission.completed
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                <span>{mission.completed ? 'Nochmal ansehen' : mission.actionText}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {completedCount === missions.length && (
        <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-center flex flex-col items-center">
          <Award className="w-8 h-8 text-indigo-600 mb-1" />
          <h3 className="font-bold text-indigo-900 text-sm">
            Hervorragend! Du hast alle Blockchain-Missionen gemeistert!
          </h3>
          <p className="text-xs text-indigo-700 mt-0.5">
            Mache jetzt das Schüler-Quiz, um dein offizielles Krypto-Diplom zu erhalten.
          </p>
        </div>
      )}
    </div>
  );
};
