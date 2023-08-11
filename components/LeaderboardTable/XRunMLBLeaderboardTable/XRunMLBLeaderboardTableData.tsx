import classNames from 'classnames'
import Image from 'next/image'
import React from 'react'

import {
  XRunMLBEntriesItem,
  XRunMLBForecast,
  XRunMLBLeaderboardResponseData,
  XRunMLBLeaderboardRunsDataItem,
} from '@/api'
import { Star } from '@/assets/icons'
import { generateParticipantImagePath, getShortName } from '@/config/constants'
import { TBodyRowData, TheadData } from '@/features/components/EntriesTable'

import styles from './XRunMLBLeaderboardTable.module.scss'

export const xRunMLBLeaderboardTheadList = (
  data: XRunMLBLeaderboardResponseData,
): TheadData<'xrun_mlb'> => {
  return {
    'entry.color': {
      title: (
        <div key="star" className={styles.starWrap}>
          <Star className={styles.star} />
        </div>
      ),
    },
    name: { title: 'Entry Name' },
    team: { title: 'Team' },
    runs: {
      title: (
        <div className={styles.runsWrap}>
          {data.runs.map((run, idx) => (
            <p key={idx}>{run.title}</p>
          ))}
        </div>
      ),
    },
    matches: {
      title: 'Matches',
    },
    games: {
      title: 'Games',
    },
  }
}

export function generateTableData(
  data: XRunMLBLeaderboardResponseData,
): TBodyRowData<'xrun_mlb'>[] {
  return data.entries
    .filter((entry) => entry.xrun_mlb_forecast)
    .map((entry: XRunMLBEntriesItem): TBodyRowData<'xrun_mlb'> => {
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
        name: { content: entry.name },
        team: {
          content: (
            <div className={styles.teamInfo}>
              <Image
                alt={entry.xrun_mlb_forecast.participant.name}
                src={generateParticipantImagePath(
                  entry.xrun_mlb_forecast.participant.external_id,
                )}
                width={30}
                height={30}
              />
              <p>
                {entry.xrun_mlb_forecast.participant.name
                  .slice(0, 3)
                  .toUpperCase()}
              </p>
            </div>
          ),
        },
        runs: {
          content: (
            <div className={styles.runsWrap}>
              {data.runs.map((run, idx) => (
                <p
                  key={idx}
                  className={classNames({
                    [styles.win]:
                      entry.xrun_mlb_forecast[
                        run.name as keyof XRunMLBForecast
                      ] ?? 0 > 0,
                  })}
                >
                  <>
                    {entry.xrun_mlb_forecast[run.name as keyof XRunMLBForecast]}
                  </>
                </p>
              ))}
            </div>
          ),
        },
        matches: {
          content: (
            <p className={styles.cellCenter}>
              {calculateRunWin(data.runs, entry.xrun_mlb_forecast)}
            </p>
          ),
        },
        games: {
          content: <p className={styles.cellCenter}>{data.runs.length}</p>,
        },
      }
    })
}

function calculateRunWin(
  runs: XRunMLBLeaderboardRunsDataItem[],
  forecasts: XRunMLBForecast,
) {
  return runs.reduce((result: number, run: XRunMLBLeaderboardRunsDataItem) => {
    if (Number(forecasts[run.name as keyof XRunMLBForecast]) > 0) {
      return ++result
    }

    return result
  }, 0)
}
