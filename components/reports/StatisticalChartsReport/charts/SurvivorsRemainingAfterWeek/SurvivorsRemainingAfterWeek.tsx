import { useEffect, useRef } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'

import { ChartsResponseData } from '@/api'
import { defaultEntryColor } from '@/config/constants'

import styles from './SurvivorsRemainingAfterWeek.module.scss'

import type {
  ValueType,
  NameType,
} from 'recharts/types/component/DefaultTooltipContent'

type SurvivorsRemainingAfterWeekProps = {
  data: ChartsResponseData['survivors_remaining_after_week']
}

export function SurvivorsRemainingAfterWeek({
  data,
}: SurvivorsRemainingAfterWeekProps) {
  const chartData = data.map((item) => ({
    week: item.week,
    survivors: item.value,
  }))

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Survivors Remaining after week</p>

      <p className={styles.survivorsLabel}>Survivors</p>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} className={styles.areaChart}>
          <defs>
            <linearGradient id="colorSurvivors" gradientTransform="rotate(90)">
              <stop offset="17.2%" stopColor="rgba(39, 50, 151, 0.05)" />
              <stop offset="102.74%" stopColor="rgba(40, 50, 141, 0)" />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="5 5"
            strokeWidth={0.5}
            stroke="#eaeaea"
            vertical={false}
          />

          <Area
            type="monotone"
            dataKey="survivors"
            stroke={defaultEntryColor}
            fillOpacity={1}
            fill="url(#colorSurvivors)"
            strokeWidth={2}
            activeDot={{
              strokeWidth: 3,
              stroke: '#fff',
              r: 7,
              fill: defaultEntryColor,
            }}
          />

          <Tooltip content={<CustomTooltip />} cursor={false} />

          <XAxis
            dataKey="week"
            axisLine={false}
            tickLine={false}
            dy={10}
            style={{ opacity: 1 }}
          />

          <YAxis
            allowDecimals={false}
            dataKey="survivors"
            axisLine={false}
            tickLine={false}
            dx={-10}
            width={36}
          />
        </AreaChart>
      </ResponsiveContainer>

      <p className={styles.weekLabel}>Week</p>
    </div>
  )
}

const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) => {
  const tooltipRef = useRef<HTMLDivElement>(null)

  // useEffect нужен для стилизации номера недели
  useEffect(() => {
    let currentTick: SVGTSpanElement | null = null

    if (!!active && !!payload?.length && tooltipRef.current) {
      const svgElement = tooltipRef.current.parentElement?.parentElement

      if (svgElement) {
        const { week } = payload[0].payload

        const ticksList = svgElement.querySelectorAll(
          '.recharts-layer.recharts-cartesian-axis.recharts-xAxis.xAxis > .recharts-cartesian-axis-ticks > .recharts-layer.recharts-cartesian-axis-tick',
        )

        for (let i = 0; i < ticksList.length; i++) {
          if (currentTick !== null) break

          const elem = ticksList[i]
          if (elem.querySelector('tspan')?.textContent === String(week)) {
            currentTick = elem.querySelector('tspan')
          }
        }

        if (currentTick) currentTick.style.opacity = '1'
      }
    }

    return () => {
      if (currentTick) currentTick.style.opacity = ''
    }
  }, [active, payload, tooltipRef])

  if (!active || !payload?.length) return null

  const { week, survivors } = payload[0].payload

  return (
    <div className={styles.customTooltip} ref={tooltipRef}>
      <p className={styles.customTooltipTitle}>Week {week}</p>

      <p className={styles.customTooltipSurvivors}>
        <span>Survivors Remaining</span>
        <span>{survivors}</span>
      </p>
    </div>
  )
}
