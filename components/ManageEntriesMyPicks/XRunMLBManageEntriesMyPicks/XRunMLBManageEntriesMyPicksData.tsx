import Image from 'next/image'
import React from 'react'

import { XRunMLBEntriesItem } from '@/api'
import { generateParticipantImagePath, getShortName } from '@/config/constants'
import { TBodyRowData, TheadData } from '@/features/components/EntriesTable'

import styles from './XRunMLBManageEntriesMyPicks.module.scss'

export const manageEntriesMyPicksTheadList: TheadData<'xrun_mlb_my_picks'> = {
  id: {
    title: '',
  },
  'entry.color': {
    title: '',
  },
  name: {
    title: 'Entry Name',
  },
  team: { title: <p className={styles.teamHeadTitle}>Team</p> },
  matches: {
    title: <p className={styles.cellCenter}>Matches</p>,
  },
  games: {
    title: <p className={styles.cellCenter}>Games</p>,
  },
}

export function generateTableData(
  data: XRunMLBEntriesItem[],
): TBodyRowData<'xrun_mlb_my_picks'>[] {
  return data
    .filter((entry) => entry.xrun_mlb_forecast)
    .map((entry: XRunMLBEntriesItem): TBodyRowData<'xrun_mlb_my_picks'> => {
      const runs = Object.entries(entry.xrun_mlb_forecast).filter(([key, _]) =>
        key.startsWith('count_run_'),
      )

      const matchesCount: number = runs[1].filter((value) => {
        const run = value as number

        return run > 0
      }).length

      return {
        id: {
          content: entry.id,
        },
        'entry.color': {
          content: (
            <div className={styles.itemNameWrap}>
              <div
                className={styles.itemName}
                style={{ backgroundColor: entry.color }}
              >
                {getShortName(entry.name).toUpperCase()}
              </div>
            </div>
          ),
        },
        name: {
          content: entry.name,
        },
        team: {
          content: (
            <div className={styles.teamInfo}>
              <Image
                alt={entry.xrun_mlb_forecast.participant.name}
                src={generateParticipantImagePath(
                  entry.xrun_mlb_forecast.participant.external_id,
                )}
                width={35}
                height={35}
              />
              <p>{entry.xrun_mlb_forecast.participant.name}</p>
            </div>
          ),
        },
        matches: {
          content: <p className={styles.cellCenter}>{matchesCount}</p>,
        },
        games: {
          content: <p className={styles.cellCenter}>{runs.length}</p>,
        },
      }
    })
}
