import {
  BarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from 'recharts'

import { ChartsResponseData } from '@/api'
import { defaultEntryColor } from '@/config/constants'

import styles from './EliminationsPerWeekChart.module.scss'

import type {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent'

type EliminationsPerWeekChartProps = {
  data: ChartsResponseData['eliminations_per_week_report']
}

export function EliminationsPerWeekChart({
  data,
}: EliminationsPerWeekChartProps) {
  const chartData = data.map((item) => ({
    week: item.week,
    eliminations: item.value,
  }))

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Eliminations per week</p>

      <p className={styles.eliminationsLabel}>Eliminations</p>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} className={styles.barChart}>
          <defs>
            <linearGradient id="MyGradient" gradientTransform="rotate(90)">
              <stop offset="0%" stopColor={defaultEntryColor} />
              <stop offset="100%" stopColor="#8CC8FF" />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="5 5"
            strokeWidth={0.5}
            stroke="#eaeaea"
            vertical={false}
          />

          <Bar
            dataKey="eliminations"
            barSize={10}
            radius={[10, 10, 0, 0]}
            style={{ fill: 'url(#MyGradient)' }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'transparent' }}
          />

          <XAxis dataKey="week" axisLine={false} tickLine={false} dy={10} />

          <YAxis
            dataKey="eliminations"
            axisLine={false}
            tickLine={false}
            dx={-10}
            width={36}
            allowDecimals={false}
          />
        </BarChart>
      </ResponsiveContainer>

      <p className={styles.weekLabel}>Week</p>
    </div>
  )
}

const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null

  const { week, eliminations } = payload[0].payload

  return (
    <div className={styles.customTooltip}>
      <p className={styles.customTooltipTitle}>Week {week}</p>

      <p className={styles.customTooltipEliminations}>
        <span>Eliminations</span>
        <span>{eliminations}</span>
      </p>
    </div>
  )
}
