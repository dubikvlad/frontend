import classNames from 'classnames'
import Image from 'next/image'

import type { LeaderboardForecastItem } from '@/api'
import { SmallRightArrowWithBorder, SmallRoundWithBorder } from '@/assets/icons'
import { generateParticipantImagePath } from '@/config/constants'

import styles from './SurvivorLeaderboardTableCell.module.scss'

type SurvivorLeaderboardTableCellProps = {
  forecasts: LeaderboardForecastItem[]
}

export function SurvivorLeaderboardTableCell({
  forecasts,
}: SurvivorLeaderboardTableCellProps) {
  const singleForecast = forecasts[0]
  const singleForecastFullName = [
    singleForecast?.participant?.city,
    singleForecast?.participant?.name,
  ]
    ?.join(' ')
    .trim()

  const isMulligan = forecasts?.some((forecast) => forecast?.is_mulligan)
  const isAutoPick = forecasts?.every((forecast) => forecast?.is_auto_pick)

  return (
    <div className={styles.cellData}>
      {forecasts.length === 1 ? (
        <div
          className={classNames(styles.cellWrapper, {
            [styles.lost]: singleForecast.status !== 'win',
            [styles.win]: singleForecast.status === 'win',
          })}
        >
          {singleForecast.status === 'no_pick' ? (
            <span className={styles.noPicks}>
              No <br /> Picks
            </span>
          ) : (
            <Image
              src={generateParticipantImagePath(
                String(singleForecast?.participant?.external_id),
              )}
              width={35}
              height={35}
              alt={String(singleForecastFullName)}
            />
          )}
        </div>
      ) : (
        <div className={styles.double}>
          {forecasts.map((forecast, i) => {
            return (
              <div
                className={classNames(styles.doubleItem, {
                  [styles.first]: i === 0,
                  [styles.second]: i === 1,
                  [styles.statusWin]: forecast.status === 'win',
                  [styles.statusLost]: forecast.status !== 'win',
                })}
                key={i}
              >
                <div className={styles.doubleItemContentWrapper}>
                  <div className={styles.doubleItemContent}>
                    {forecast.status === 'no_pick' ? (
                      <span className={styles.noPicks}>
                        No <br /> Picks
                      </span>
                    ) : (
                      <Image
                        src={generateParticipantImagePath(
                          String(singleForecast?.participant?.external_id),
                        )}
                        width={22}
                        height={22}
                        alt={String(singleForecastFullName)}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {isMulligan && (
        <SmallRoundWithBorder
          className={classNames(styles.smallIcon, styles.addIcon, {
            [styles.bot]: isAutoPick,
          })}
        />
      )}
      {isAutoPick && (
        <SmallRightArrowWithBorder
          className={classNames(
            styles.smallIcon,
            styles.addIcon,
            styles.addIconArrow,
          )}
        />
      )}
    </div>
  )
}
