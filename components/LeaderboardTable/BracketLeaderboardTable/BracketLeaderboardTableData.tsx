import React from 'react'

import { BracketLeaderboardEntries } from '@/api'
import { Star } from '@/assets/icons'
import { EntryUserIcon } from '@/features/components'
import type {
  TBodyRowData,
  TheadData,
} from '@/features/components/EntriesTable'

import styles from './BracketLeaderboardTable.module.scss'

export const BracketLeaderboardTheadList: TheadData = {
  place: { title: '' },
  'entry.color': {
    title: (
      <div key="star" className={styles.starWrap}>
        <Star className={styles.star} />
      </div>
    ),
  },
  'entry.name': { title: 'Name', sort: { name: 'entry.name' } },
  currentPoints: { title: 'Points', sort: { name: 'currentPoints' } },
  possiblePoints: {
    title: 'Possible Points',
    sort: { name: 'possiblePoints' },
  },
  round_1: { title: 'Round 1' },
  round_2: { title: 'Round 2' },
  round_3: { title: 'Round 3' },
  round_4: { title: 'Round 4' },
  predictedChampion: {
    title: 'Predicted Champion',
    sort: { name: 'predictedChampion' },
  },
}

export function generateTableData(
  data: BracketLeaderboardEntries[],
  currentUserId: number | undefined,
): TBodyRowData[] {
  return data.map((entry: BracketLeaderboardEntries): TBodyRowData => {
    const currentUser: boolean = entry.entry.user_id === currentUserId
    const currentUserBg: string = currentUser ? '#FFFEF2' : ''

    return {
      place: { content: entry.place, bgColor: currentUserBg },
      'entry.color': {
        content: (
          <EntryUserIcon
            isCurrentUser={currentUser}
            color={entry.entry.color}
            userName={entry.entry.name}
          />
        ),
        bgColor: currentUserBg,
      },
      'entry.name': { content: entry.entry.name, bgColor: currentUserBg },
      currentPoints: { content: entry.currentPoints, bgColor: currentUserBg },
      possiblePoints: { content: entry.possiblePoints, bgColor: currentUserBg },
      round_1: { content: entry.winsByRound[0], bgColor: currentUserBg },
      round_2: { content: entry.winsByRound[1], bgColor: currentUserBg },
      round_3: { content: entry.winsByRound[2], bgColor: currentUserBg },
      round_4: { content: entry.winsByRound[3], bgColor: currentUserBg },
      predictedChampion: {
        content: entry.predictedChampion,
        bgColor: currentUserBg,
      },
    }
  })
}
