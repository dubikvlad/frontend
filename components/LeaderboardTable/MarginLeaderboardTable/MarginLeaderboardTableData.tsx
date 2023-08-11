import React from 'react'

import { MarginLeaderboardResponseDataItem } from '@/api'
import { Star } from '@/assets/icons'
import { EntryUserIcon } from '@/features/components'
import { TBodyRowData, TheadData } from '@/features/components/EntriesTable'

import styles from './MarginLeaderboardTable.module.scss'

export const MarginLeaderboardTheadList: TheadData<'margin'> = {
  place: { title: '' },
  'entry.color': {
    title: (
      <div key="star" className={styles.starWrap}>
        <Star className={styles.star} />
      </div>
    ),
  },
  name: { title: 'Name', sort: { name: 'name' } },
  count_win: { title: 'Wins', sort: { name: 'count_win' } },
  count_lost: {
    title: 'Losses',
    sort: { name: 'count_lost' },
  },
  points: {
    title: 'Points',
    sort: { name: 'points' },
  },
}

export function generateTableData(
  data: MarginLeaderboardResponseDataItem[],
  currentUserId: number | undefined,
): TBodyRowData<'margin'>[] {
  return data.map(
    (
      entry: MarginLeaderboardResponseDataItem,
      i: number,
    ): TBodyRowData<'margin'> => {
      const currentUser: boolean = entry.user_id === currentUserId
      const cellBg: string = currentUser ? 'var(--bg-color-4)' : ''

      return {
        place: { content: i + 1, bgColor: cellBg },
        'entry.color': {
          content: (
            <EntryUserIcon
              isCurrentUser={currentUser}
              color={entry.entry_color}
              userName={entry.name}
            />
          ),
          bgColor: cellBg,
        },
        name: { content: entry.name, bgColor: cellBg },
        count_win: { content: entry.count_win, bgColor: cellBg },
        count_lost: {
          content: entry.count_lost,
          bgColor: cellBg,
        },
        points: {
          content: <p className={styles.pointsText}>{entry.points}</p>,
          colored: true,
          bgColor: currentUser ? 'var(--bg-color-6)' : '',
        },
      }
    },
  )
}
