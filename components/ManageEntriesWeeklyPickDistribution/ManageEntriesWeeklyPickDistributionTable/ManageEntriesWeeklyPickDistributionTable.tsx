import classNames from 'classnames'
import Image from 'next/image'
import { useMemo } from 'react'

import {
  WeeklyPickDistributionResponse,
  WeeklyPickDistributionResponseData,
} from '@/api'
import { generateParticipantImagePath } from '@/config/constants'

import styles from './ManageEntriesWeeklyPickDistributionTable.module.scss'

export function ManageEntriesWeeklyPickDistributionTable({
  games = [],
}: {
  games: WeeklyPickDistributionResponse
}) {
  return (
    <div className={styles.wrapper}>
      <table>
        <thead>
          <tr>
            <th>Away Team</th>
            <th>Total</th>
            <th className={styles.raitingCol} />
            <th>Total</th>
            <th>Home Team</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, i) => (
            <GameRow key={i} game={game} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GameRow({ game }: { game: WeeklyPickDistributionResponseData }) {
  const deadlinePassed = game.passed
  const { home, away } = game.participants

  const homeFullName = [home?.participant_city, home?.participant_name]
    ?.join(' ')
    .trim()
  const awayFullName = [away?.participant_city, away?.participant_name]
    ?.join(' ')
    .trim()

  function makeSortName(name: string) {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
  }

  return (
    <>
      {home && away && (
        <tr className={styles.row}>
          <td>
            <div className={styles.leftData}>
              <Image
                src={generateParticipantImagePath(
                  String(away.participant_external_id),
                )}
                width={60}
                height={60}
                alt="img"
              />
              <div className={styles.teamNames}>
                <span className={styles.nameShort}>
                  {away.participant_short_name ?? makeSortName(awayFullName)}
                </span>
                <span className={styles.nameFull}>{awayFullName}</span>
              </div>
            </div>
          </td>
          <td>
            {deadlinePassed
              ? !away?.count && !home?.count
                ? ''
                : away?.count
              : ''}
          </td>
          <td className={styles.raitingCol}>
            {(!away?.count && !home?.count) || !deadlinePassed ? (
              <div className={styles.centerd}>
                {deadlinePassed ? 'No Picks' : 'TBD'}
              </div>
            ) : (
              <Raiting leftCount={away.count} rightCount={home.count} />
            )}
          </td>
          <td>
            {deadlinePassed
              ? !away?.count && !home?.count
                ? ''
                : home?.count
              : ''}
          </td>
          <td>
            <div className={styles.rightData}>
              <div className={styles.teamNames}>
                <span className={styles.nameShort}>
                  {home.participant_short_name ?? makeSortName(homeFullName)}
                </span>
                <span className={styles.nameFull}>{homeFullName}</span>
              </div>
              <Image
                src={generateParticipantImagePath(
                  String(home.participant_external_id),
                )}
                width={60}
                height={60}
                alt="img"
              />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function Raiting({ leftCount = 0, rightCount = 0 }) {
  const { leftWidth, rightWidth } = useMemo(
    () => ({
      leftWidth:
        leftCount !== rightCount
          ? Math.round((leftCount / (leftCount + rightCount)) * 100)
          : 50,
      rightWidth:
        leftCount !== rightCount
          ? Math.round((rightCount / (leftCount + rightCount)) * 100)
          : 50,
    }),
    [leftCount, rightCount],
  )

  return (
    <div
      className={classNames(styles.raitingWrapper, {
        [styles.r100]: leftWidth > 90,
        [styles.r90]: leftWidth > 80 && leftWidth <= 90,
        [styles.r80]: leftWidth > 70 && leftWidth <= 80,
        [styles.r70]: leftWidth > 60 && leftWidth <= 70,
        [styles.r60]: leftWidth > 50 && leftWidth <= 60,
        [styles.r50]: leftWidth > 40 && leftWidth <= 50,
        [styles.r40]: leftWidth > 30 && leftWidth <= 40,
        [styles.r30]: leftWidth > 20 && leftWidth <= 30,
        [styles.r20]: leftWidth > 10 && leftWidth <= 20,
        [styles.r10]: leftWidth > 0 && leftWidth <= 10,
        [styles.r0]: leftWidth == 0,
      })}
    >
      <span>{leftWidth}%</span>
      <span>{rightWidth}%</span>
    </div>
  )
}
