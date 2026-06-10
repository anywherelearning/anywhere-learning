'use client';

/**
 * Year-at-a-glance heatmap (GitHub contributions style).
 *
 * Renders ~52 weeks × 7 days of cells colored by entry count per day.
 * Tooltips show the date and count on hover.
 * Click a day to scroll/filter to that day in the list (optional callback).
 */

import { useMemo } from 'react';
import { SERIF } from './dashboard-shared';
import type { LogEntry } from './dashboard-types';

const DAY_LABELS = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function toISO(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function levelFor(count: number, max: number): number {
  if (count === 0) return 0;
  if (max <= 1) return 4;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

const LEVEL_COLORS = ['#EDE9DC', '#D9DFC9', '#A6BEA1', '#739E7A', '#3A5A40'];

interface YearHeatmapProps {
  entries: LogEntry[];
  endDate?: Date;
  onDayClick?: (isoDate: string) => void;
}

export default function YearHeatmap({ entries, endDate, onDayClick }: YearHeatmapProps) {
  const end = endDate ?? new Date();
  end.setHours(0, 0, 0, 0);

  const { weeks, totalCount, monthLabels, max } = useMemo(() => {
    // 53 weeks × 7 days. Start at the most recent Saturday, work backward.
    const lastDay = new Date(end);
    // Round forward to nearest Saturday for column alignment
    const dayOfWeek = lastDay.getDay();
    const daysToSat = 6 - dayOfWeek;
    lastDay.setDate(lastDay.getDate() + daysToSat);

    const start = new Date(lastDay);
    start.setDate(start.getDate() - 53 * 7 + 1);

    const counts: Record<string, number> = {};
    for (const e of entries) {
      counts[e.date] = (counts[e.date] || 0) + 1;
    }

    const weeks: Array<Array<{ date: string; count: number; future: boolean }>> = [];
    let cursor = new Date(start);
    let max = 0;
    let total = 0;

    for (let w = 0; w < 53; w++) {
      const week: Array<{ date: string; count: number; future: boolean }> = [];
      for (let d = 0; d < 7; d++) {
        const iso = toISO(cursor);
        const count = counts[iso] || 0;
        const future = cursor > end;
        week.push({ date: iso, count, future });
        if (!future && cursor >= start) {
          max = Math.max(max, count);
          total += count;
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }

    // Month labels per column - mark when month changes from previous column's first day
    const monthLabels: Array<{ index: number; label: string }> = [];
    let prevMonth = -1;
    weeks.forEach((week, i) => {
      const firstDayOfWeek = week[0];
      if (firstDayOfWeek.future) return;
      const m = new Date(firstDayOfWeek.date + 'T00:00:00').getMonth();
      if (m !== prevMonth) {
        monthLabels.push({ index: i, label: MONTHS_SHORT[m] });
        prevMonth = m;
      }
    });

    return { weeks, totalCount: total, monthLabels, max };
  }, [entries, end]);

  const cell = 12;
  const gap = 3;
  const dayLabelWidth = 24;

  return (
    <div
      style={{
        background: '#FAF9F6',
        border: '1px solid #E5E0D2',
        borderRadius: 14,
        padding: '14px 16px',
        overflow: 'auto',
      }}
    >
      <div
        className="flex justify-between items-baseline mb-3 gap-3"
        style={{ minWidth: 0 }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 16,
            color: '#2D3A2E',
            whiteSpace: 'nowrap',
          }}
        >
          {totalCount} {totalCount === 1 ? 'entry' : 'entries'} in the last year
        </h3>
        <div
          className="flex items-center gap-1.5"
          style={{ fontSize: 11, color: '#7B8378' }}
        >
          <span>Less</span>
          {LEVEL_COLORS.map((c, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: 2,
                background: c,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'inline-block', minWidth: '100%' }}>
        <svg
          width={dayLabelWidth + weeks.length * (cell + gap)}
          height={20 + 7 * (cell + gap)}
          style={{ display: 'block' }}
        >
          {/* Month labels */}
          {monthLabels.map(({ index, label }) => (
            <text
              key={`${label}-${index}`}
              x={dayLabelWidth + index * (cell + gap)}
              y={12}
              fontSize={10}
              fontFamily="DM Sans, sans-serif"
              fill="#7B8378"
            >
              {label}
            </text>
          ))}

          {/* Day labels (Sun/Tue/Thu/Sat) */}
          {DAY_LABELS.map((label, i) =>
            label ? (
              <text
                key={`day-${i}`}
                x={0}
                y={20 + i * (cell + gap) + cell - 2}
                fontSize={9}
                fontFamily="DM Sans, sans-serif"
                fill="#7B8378"
              >
                {label}
              </text>
            ) : null
          )}

          {/* Cells */}
          {weeks.map((week, w) =>
            week.map((day, d) => {
              if (day.future) return null;
              const level = levelFor(day.count, max);
              const x = dayLabelWidth + w * (cell + gap);
              const y = 20 + d * (cell + gap);
              return (
                <rect
                  key={day.date}
                  x={x}
                  y={y}
                  width={cell}
                  height={cell}
                  rx={2}
                  ry={2}
                  fill={LEVEL_COLORS[level]}
                  style={{ cursor: onDayClick && day.count > 0 ? 'pointer' : 'default' }}
                  onClick={() => onDayClick?.(day.date)}
                >
                  <title>
                    {day.count === 0
                      ? `No entries on ${day.date}`
                      : `${day.count} ${day.count === 1 ? 'entry' : 'entries'} on ${day.date}`}
                  </title>
                </rect>
              );
            })
          )}
        </svg>
      </div>
    </div>
  );
}
