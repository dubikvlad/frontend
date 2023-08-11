import React from 'react'

import { LeaderboardResponseData } from '@/api'
import { EntryUserIcon } from '@/features/components'
import type {
  TBodyRowData,
  TheadData,
} from '@/features/components/EntriesTable'

export const theadList: TheadData<'golf_majors_by_tournament'> = {
  place: { title: '' },
  entryColor: { title: '' },
  entryName: {
    title: 'Entry Name',
    sort: { name: 'entryName' },
  },
  totalToPar: {
    title: 'Total to Par',
    sort: { name: 'totalToPar' },
  },
  tieDiff: {
    title: 'Tie Diff',
    sort: { name: 'tieDiff' },
  },
  feDex: {
    title: 'FedEx',
    sort: { name: 'feDex' },
  },
  winnings: {
    title: 'Winnings',
  },
}

export function generateTableData({
  data,
}: {
  data: LeaderboardResponseData<'golf_majors'>
}): TBodyRowData<'golf_majors_by_tournament'>[] {
  return data.map((entry): TBodyRowData<'golf_majors_by_tournament'> => {
    return {
      place: { content: entry.position },
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
      totalToPar: {
        content: entry.total_par,
        colored: true,
      },
      tieDiff: {
        content: entry.tie_diff,
      },
      feDex: { content: entry.fedex_points, colored: true },
      winnings: {
        content: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(entry.winnings),
      },
    }
  })
}
