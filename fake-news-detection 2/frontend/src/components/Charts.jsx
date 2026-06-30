import React, { useMemo } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useTheme } from "../hooks/useTheme.jsx";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const REAL_COLOR = "#2D6A4F";
const FAKE_COLOR = "#9D2933";

function useChartTextColor() {
  const { theme } = useTheme();
  return theme === "dark" ? "#9CA3AF" : "#6B7280";
}

/** Doughnut chart showing REAL vs FAKE prediction breakdown. */
export function VerdictBreakdownChart({ realCount, fakeCount }) {
  const textColor = useChartTextColor();
  const total = realCount + fakeCount;

  const data = useMemo(
    () => ({
      labels: ["Real", "Fake"],
      datasets: [
        {
          data: [realCount, fakeCount],
          backgroundColor: [REAL_COLOR, FAKE_COLOR],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    }),
    [realCount, fakeCount]
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: textColor, boxWidth: 10, boxHeight: 10, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pct = total ? ((ctx.parsed / total) * 100).toFixed(1) : "0.0";
            return `${ctx.label}: ${ctx.parsed} (${pct}%)`;
          },
        },
      },
    },
  };

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-signal-slate">
        No predictions yet
      </div>
    );
  }

  return (
    <div className="h-56">
      <Doughnut data={data} options={options} />
    </div>
  );
}

/** Line chart showing REAL/FAKE prediction counts over time. */
export function PredictionsOverTimeChart({ series }) {
  const textColor = useChartTextColor();

  const data = useMemo(
    () => ({
      labels: series.map((point) => {
        const d = new Date(point.date);
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      }),
      datasets: [
        {
          label: "Real",
          data: series.map((point) => point.real),
          borderColor: REAL_COLOR,
          backgroundColor: `${REAL_COLOR}1A`,
          fill: true,
          tension: 0.35,
          pointRadius: 2,
        },
        {
          label: "Fake",
          data: series.map((point) => point.fake),
          borderColor: FAKE_COLOR,
          backgroundColor: `${FAKE_COLOR}1A`,
          fill: true,
          tension: 0.35,
          pointRadius: 2,
        },
      ],
    }),
    [series]
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "bottom", labels: { color: textColor, boxWidth: 10, boxHeight: 10, font: { size: 12 } } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
      y: {
        beginAtZero: true,
        ticks: { color: textColor, precision: 0, font: { size: 11 } },
        grid: { color: "rgba(107, 114, 128, 0.1)" },
      },
    },
  };

  if (series.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-signal-slate">
        Not enough data yet — analyze a few articles to see trends here.
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
}
