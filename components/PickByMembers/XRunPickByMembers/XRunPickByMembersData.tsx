import Image from 'next/image'
import React from 'react'

import { XRunEntriesItem } from '@/api'
import { generateParticipantImagePath, getShortName } from '@/config/constants'
import { TBodyRowData, TheadData } from '@/features/components/EntriesTable'

import styles from './XRunPickByMembers.module.scss'

export const pickByMembersTheadList: TheadData<'xrun_picks_by_members'> = {
  'entry.color': {
    title: '',
  },
  name: {
    title: 'Entry Name',
  },
  team: { title: <p className={styles.teamHeadTitle}>Team</p> },
  score: {
    title: <p className={styles.cellCenter}>Scored by the team</p>,
  },
}

export function generateTableData({
  data,
  currentWeek,
}: {
  data: XRunEntriesItem[]
  currentWeek: number | null
}): TBodyRowData<'xrun_picks_by_members'>[] {
  return data
    .filter((entry) => entry.xrun_forecasts.length)
    .map((entry): TBodyRowData<'xrun_picks_by_members'> => {
      const forecastByWeek = entry.xrun_forecasts.find(
        (forecast) => forecast.week_number === currentWeek,
      )

      return {
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
              {forecastByWeek ? (
                <>
                  <Image
                    alt={forecastByWeek.participant.name}
                    src={generateParticipantImagePath(
                      forecastByWeek.participant.external_id,
                    )}
                    width={35}
                    height={35}
                  />
                  <p>{forecastByWeek.participant.name}</p>
                </>
              ) : null}
            </div>
          ),
        },
        score: {
          content: (
            <p className={styles.cellCenter}>
              {forecastByWeek?.score ? forecastByWeek.score : '-'}
            </p>
          ),
        },
      }
    })
}
