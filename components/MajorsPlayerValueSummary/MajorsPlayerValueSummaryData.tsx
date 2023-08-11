import classNames from 'classnames'
import React from 'react'

import { GolfPlayerValueSummaryResData } from '@/api'
import type {
  TBodyRowData,
  TheadData,
} from '@/features/components/EntriesTable'

import styles from './MajorsPlayerValueSummary.module.scss'

export const theadList: TheadData<'golf_majors_player_value_summary'> = {
  name: { title: 'Player', sort: { name: 'name' } },
  score: { title: 'Score', sort: { name: 'score' } },
  salary: { title: 'Salary', sort: { name: 'salary' } },
  value: { title: 'Value', sort: { name: 'value' } },
  scale: { title: '' },
}

export function generateTableData({
  data,
  maxScaleValue,
}: {
  data: GolfPlayerValueSummaryResData[]
  maxScaleValue: number
}): TBodyRowData<'golf_majors_player_value_summary'>[] {
  return data.map((entry): TBodyRowData<'golf_majors_player_value_summary'> => {
    const percentValueScale = (entry.value / maxScaleValue) * 100

    return {
      name: { content: entry.name },
      score: {
        content: (
          <p
            className={classNames(styles.points, {
              [styles.minus]: entry.score > 0,
            })}
          >
            {entry.score === 0
              ? 'E'
              : entry.score > 0
              ? `+${entry.score}`
              : entry.score}
          </p>
        ),
      },
      salary: {
        content: `$${entry.salary}`,
      },
      value: { content: <p className={styles.value}>{entry.value}</p> },
      scale: {
        content: (
          <div
            className={styles.scale}
            style={{
              width: maxScaleValue,
              background: `linear-gradient(to right, var(--win-color-2) ${percentValueScale}%, var(--border-color) ${percentValueScale}%)`,
            }}
          ></div>
        ),
      },
    }
  })
}
