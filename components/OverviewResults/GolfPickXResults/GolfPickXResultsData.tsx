import { GolfTournamentResult } from '@/api'
import type {
  TBodyRowData,
  TheadData,
} from '@/features/components/EntriesTable'

export const theadList: TheadData<'golf_pick_x_results'> = {
  place: { title: 'Rate', sort: { name: 'place' } },
  entryName: {
    title: 'Golfer Name',
    sort: { name: 'entryName' },
  },
  totalToPar: {
    title: 'Total to Par',
    sort: { name: 'totalToPar' },
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
  data: GolfTournamentResult[]
}): TBodyRowData<'golf_pick_x_results'>[] {
  return data.map((player): TBodyRowData<'golf_pick_x_results'> => {
    return {
      place: { content: Number(player.position) },
      entryName: {
        content: player.name,
      },
      totalToPar: {
        content: player.to_par_points,
        colored: true,
      },
      feDex: {
        content: Number(player.fedex_points),
      },
      winnings: {
        content: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(player.winning),
        colored: true,
      },
    }
  })
}
