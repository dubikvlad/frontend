import classNames from 'classnames'

import { GolfPlayerPerformanceSummaryResData } from '@/api'
import type {
  TBodyRowData,
  TheadData,
} from '@/features/components/EntriesTable'

import styles from './MajorsPlayerPerformanceSummary.module.scss'

export const theadList: TheadData<'golf_majors_player_performance_summary'> = {
  worldRank: { title: 'Rank', sort: { name: 'worldRank' } },
  name: { title: 'Player', sort: { name: 'name' } },
  score: { title: 'Score', sort: { name: 'score' } },
  pars: { title: 'Pars', sort: { name: 'pars' } },
  birdies: { title: 'Birdies', sort: { name: 'birdies' } },
  eagles: { title: 'Eagles', sort: { name: 'eagles' } },
  bogeys: { title: 'Bogeys', sort: { name: 'bogeys' } },
  doubles: { title: 'Doubles', sort: { name: 'doubles' } },
  triples: { title: 'Triples' },
  albatross: { title: 'Albatross' },
}

export function generateTableData({
  data,
}: {
  data: GolfPlayerPerformanceSummaryResData[]
}): TBodyRowData<'golf_majors_player_performance_summary'>[] {
  return data.map(
    (entry): TBodyRowData<'golf_majors_player_performance_summary'> => {
      return {
        worldRank: { content: entry.worldRank },
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
          coloredGreen: true,
        },
        pars: { content: entry.pars ?? '' },
        birdies: {
          content: entry.birdies ?? '',
          coloredGreen: true,
        },
        eagles: { content: entry.eagles ?? '' },
        bogeys: { content: entry.bogeys ?? '', coloredGreen: true },
        doubles: { content: entry.doubles ?? '' },
        triples: { content: '', coloredGreen: true },
        albatross: { content: '' },
      }
    },
  )
}
