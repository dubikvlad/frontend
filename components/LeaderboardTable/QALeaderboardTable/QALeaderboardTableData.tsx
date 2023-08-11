import React from 'react'

import { QALeaderboardForecast } from '@/api'
import { Star } from '@/assets/icons'
import { EntryUserIcon } from '@/features/components'
import type {
  TBodyRowData,
  TheadData,
} from '@/features/components/EntriesTable'

import styles from './QALeaderboardTable.module.scss'

export const theadList: TheadData<'qa'> = {
  id: { title: '' },
  entryColor: {
    title: (
      <div key="star" className={styles.starWrap}>
        <Star className={styles.star} />
      </div>
    ),
  },
  entryName: { title: 'Name', sort: { name: 'entryName' } },
  questionsAnswered: {
    title: 'Number of questions answered',
    sort: { name: 'questionsAnswered' },
  },
  correctAnswers: {
    title: 'Correct answers',
    sort: { name: 'correctAnswers' },
  },
  points: {
    title: 'Points',
    sort: { name: 'points' },
  },
}

export function generateTableData({
  data,
  currentUserId,
  questionsAmount,
}: {
  data: QALeaderboardForecast[]
  currentUserId: number | undefined
  questionsAmount: number
}): TBodyRowData<'qa'>[] {
  return data.map((entry, i): TBodyRowData<'qa'> => {
    const currentUser: boolean = entry.entry.user_id === currentUserId
    const cellBg: string = currentUser ? 'var(--bg-color-4)' : ''

    return {
      id: { content: i + 1, bgColor: cellBg },
      entryColor: {
        content: (
          <EntryUserIcon
            isCurrentUser={currentUser}
            color={entry.entry.color}
            userName={entry.entry.name}
          />
        ),
        bgColor: cellBg,
      },
      entryName: { content: entry.entry.name, bgColor: cellBg },
      questionsAnswered: {
        content: `${entry.entry.q_a_forecast?.answers.length}/${questionsAmount}`,
        bgColor: cellBg,
      },
      correctAnswers: { content: entry.correct, bgColor: cellBg },
      points: {
        content: <div className={styles.points}>{entry.total_points}</div>,
        bgColor: currentUser ? 'var(--bg-color-6)' : '',
        colored: true,
      },
    }
  })
}
