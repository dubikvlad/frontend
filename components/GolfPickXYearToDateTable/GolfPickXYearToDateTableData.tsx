import React from 'react'

import { LeaderboardResponseData } from '@/api'
import { EntryUserIcon } from '@/features/components'
import type {
  TBodyRowData,
  TheadData,
} from '@/features/components/EntriesTable'

export const theadList: TheadData<'golf_pick_x'> = {
  place: { title: '' },
  entryColor: { title: '' },
  entryName: {
    title: 'Entry Name',
    sort: { name: 'entryName' },
  },
  winnings: {
    title: 'Winnings',
  },
  totalToPar: {
    title: 'Total to Par',
    sort: { name: 'totalToPar' },
  },
  feDex: {
    title: 'FedEx',
    sort: { name: 'feDex' },
  },
}

export function generateTableData({
  data,
}: {
  data: LeaderboardResponseData<'golf_pick_x'>
}): TBodyRowData<'golf_pick_x'>[] {
  return data.map((entry): TBodyRowData<'golf_pick_x'> => {
    return {
      place: { content: entry.place },
      entryColor: {
        content: (
          <EntryUserIcon
            isCurrentUser={false}
            color={entry.color}
            userName={entry.name}
          />
        ),
      },
      entryName: {
        content: entry.name,
      },
      winnings: {
        content: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(entry.winning),
        colored: true,
      },
      totalToPar: {
        content: entry.scoreToPar,
      },
      feDex: {
        content: entry.fedExPoints,
        colored: true,
      },
    }
  })
}
