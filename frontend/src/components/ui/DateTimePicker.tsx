"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface DateTimePickerProps {
  label?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDisplay(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()} at ${pad(d.getHours() % 12 || 12)}:${pad(d.getMinutes())} ${d.getHours() >= 12 ? "PM" : "AM"}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function DateTimePicker({
  label,
  value = "",
  onChange,
  required,
  error,
  placeholder = "Select date and time",
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const parsed = value ? new Date(value) : null;

  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? now.getMonth());
  const [selectedDay, setSelectedDay] = useState(parsed?.getDate() ?? now.getDate());
  const [hour, setHour] = useState(parsed ? parsed.getHours() % 12 || 12 : 12);
  const [minute, setMinute] = useState(parsed?.getMinutes() ?? 0);
  const [ampm, setAmpm] = useState(parsed ? (parsed.getHours() >= 12 ? "PM" : "AM") : "AM");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const emitValue = (day: number, h: number, m: number, ap: string) => {
    const hours24 = ap === "PM" ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
    const iso = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}T${pad(hours24)}:${pad(m)}`;
    onChange?.({ target: { value: iso } });
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    emitValue(day, hour, minute, ampm);
  };

  const handleTimeChange = (h: number, m: number, ap: string) => {
    setHour(h);
    setMinute(m);
    setAmpm(ap);
    emitValue(selectedDay, h, m, ap);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const today = new Date();
  const isToday = (d: number) => d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isSelected = (d: number) => d === selectedDay && parsed && viewMonth === parsed.getMonth() && viewYear === parsed.getFullYear();

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          w-full flex items-center gap-3 rounded-lg border bg-white text-sm
          px-4 py-2.5 transition-all duration-200 text-left cursor-pointer
          ${open
            ? "border-blue-500 ring-2 ring-blue-100"
            : error
              ? "border-red-300"
              : "border-slate-200 hover:border-slate-300"
          }
        `}
      >
        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className={value ? "text-slate-800" : "text-slate-400"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 left-0 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border-0 overflow-hidden w-[320px]">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            <span className="text-sm font-semibold text-slate-800">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="px-4 pb-2">
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[11px] font-medium text-slate-400 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={`
                      w-9 h-9 mx-auto rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer
                      ${isSelected(day)
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : isToday(day)
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-slate-700 hover:bg-slate-100"
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-3 flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-1">
              <select
                value={hour}
                onChange={(e) => handleTimeChange(Number(e.target.value), minute, ampm)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 text-center w-14 cursor-pointer hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>{pad(h)}</option>
                ))}
              </select>
              <span className="text-slate-400 font-bold">:</span>
              <select
                value={minute}
                onChange={(e) => handleTimeChange(hour, Number(e.target.value), ampm)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 text-center w-14 cursor-pointer hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
              >
                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                  <option key={m} value={m}>{pad(m)}</option>
                ))}
              </select>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden ml-1">
                <button
                  type="button"
                  onClick={() => handleTimeChange(hour, minute, "AM")}
                  className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${ampm === "AM" ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeChange(hour, minute, "PM")}
                  className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${ampm === "PM" ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                setViewYear(t.getFullYear());
                setViewMonth(t.getMonth());
                setSelectedDay(t.getDate());
                const h12 = t.getHours() % 12 || 12;
                const ap = t.getHours() >= 12 ? "PM" : "AM";
                setHour(h12);
                setMinute(t.getMinutes());
                setAmpm(ap);
                emitValue(t.getDate(), h12, t.getMinutes(), ap);
              }}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
