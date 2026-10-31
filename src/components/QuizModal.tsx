import React, { useState } from 'react';
import { QUIZ_QUESTIONS, QuizQuestion } from '../data/learningContent';
import confetti from 'canvas-confetti';
import {
  Award,
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizCompleted: () => void;
  studentName?: string;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  onQuizCompleted,
  studentName = 'Klasse 8 Schüler/in',
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  if (!isOpen) return null;

  const question = QUIZ_QUESTIONS[currentQuestionIndex];
  const selectedOption = selectedAnswers[question.id];
  const isAnswered = selectedOption !== undefined;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    const newAnswers = { ...selectedAnswers, [question.id]: idx };
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);

    // If last question, finish quiz
    if (Object.keys(newAnswers).length === QUIZ_QUESTIONS.length) {
      setTimeout(() => {
        setIsFinished(true);
        onQuizCompleted();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 1200);
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      onQuizCompleted();
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    setIsFinished(false);
  };

  // Score calculation
  const correctCount = QUIZ_QUESTIONS.reduce((count, q) => {
    return selectedAnswers[q.id] === q.correctIndex ? count + 1 : count;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Schüler-Krypto-Quiz & Diplom
              </h2>
              <p className="text-xs text-slate-500">
                Teste dein Wissen über Blockchain, Mining und Fälschungssicherheit.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {!isFinished ? (
            <div>
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>
                  Frage <strong>{currentQuestionIndex + 1}</strong> von {QUIZ_QUESTIONS.length}
                </span>
                <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                  Thema: {question.category}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mb-4 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question */}
              <h3 className="text-sm font-bold text-slate-900 mb-3 leading-snug">
                {question.question}
              </h3>

              {/* Options */}
              <div className="space-y-2">
                {question.options.map((opt, idx) => {
                  let buttonStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

                  if (isAnswered) {
                    if (idx === question.correctIndex) {
                      buttonStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                    } else if (idx === selectedOption) {
                      buttonStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                    } else {
                      buttonStyle = 'opacity-50 border-slate-200 bg-white text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex items-start gap-2.5 ${buttonStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-snug">{opt}</span>
                      {isAnswered && idx === question.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1 mt-0.5" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== question.correctIndex && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-1 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation note */}
              {isAnswered && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-xs text-slate-900">
                    <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                    Erklärung:
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    {question.explanation}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs flex items-center gap-1 transition-colors"
                    >
                      <span>
                        {currentQuestionIndex < QUIZ_QUESTIONS.length - 1
                          ? 'Nächste Frage'
                          : 'Ergebnis anzeigen'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Certificate & Final Score View */
            <div className="space-y-4">
              {/* Diploma Card */}
              <div className="p-6 bg-linear-to-b from-amber-50/70 to-emerald-50/70 border-2 border-amber-300 rounded-2xl text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <Award className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800">
                  Offizielles Schullabor-Zertifikat
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Blockchain-Diplom
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Hiermit wird bescheinigt, dass <strong>{studentName}</strong> die Grundlagen der
                  Blockchain-Technologie, Krypto-Erzeugung und Fälschungssicherheit erfolgreich verstanden hat.
                </p>

                <div className="my-4 py-3 border-y border-amber-200/80 flex items-center justify-center gap-8">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Erreichte Punktzahl</span>
                    <span className="text-xl font-bold font-mono text-emerald-700">
                      {correctCount} / {QUIZ_QUESTIONS.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Ergebnis</span>
                    <span className="text-sm font-bold text-slate-800">
                      {correctCount >= 4 ? 'Ausgezeichnet ⭐⭐⭐' : 'Erfolgreich bestanden 👍'}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kryptografisch verifiziert im Schuljahr 2026</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="flex-1 py-2 px-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Quiz wiederholen</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  Zurück zum Labor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
