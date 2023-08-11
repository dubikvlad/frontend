import classNames from 'classnames'
import Image from 'next/image'
import React from 'react'

import { PlayersLeaderboardTableType } from '@/api'
import { EmptyAvatar } from '@/assets/icons'
import { TablePagination } from '@/features/ui'
import { getOrdinalString, useTablePagination } from '@/helpers'

import styles from './PlayersLeaderboardTable.module.scss'

const tHeadList = ['', 'Player', 'Total', 'Thru', 'Picked'] as const

type PlayersLeaderboardTableProps = {
  players: PlayersLeaderboardTableType[]
}

export function PlayersLeaderboardTable({
  players,
}: PlayersLeaderboardTableProps) {
  const {
    slicedDataArr,
    activePage,
    handleChangePage,
    activeIndex,
    pagesArray,
  } = useTablePagination<PlayersLeaderboardTableType>({
    dataArr: players,
  })

  return (
    <div
      className={classNames(styles.container, {
        [styles.anotherIndent]: !slicedDataArr.length,
      })}
    >
      <h2>Tournament leaderboard</h2>

      <Pedestal players={slicedDataArr} />

      <Table players={slicedDataArr} />

      <TablePagination
        activePage={activePage}
        handleChangePage={handleChangePage}
        pagesArray={pagesArray}
        activeIndex={activeIndex}
      />
    </div>
  )
}

function Pedestal({ players }: { players: PlayersLeaderboardTableType[] }) {
  return (
    <div className={styles.pedestal}>
      {players.length ? (
        <>
          {players.slice(0, 3).map((player) => (
            <div key={player.golfPlayerId} className={styles.player}>
              <Image
                src={player.image}
                width={60}
                height={80}
                alt={player.name}
              />
              <p>{player.lastName}</p>

              <span className={styles.position}>{player.position}</span>
            </div>
          ))}
        </>
      ) : (
        <>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.player}>
              <EmptyAvatar />
              <p>{getOrdinalString(i + 1)}&nbsp;Place</p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function Table({ players }: { players: PlayersLeaderboardTableType[] }) {
  return (
    <>
      {players.length ? (
        <div className={styles.table}>
          <div className={styles.tHead}>
            {tHeadList.map((ttl, i) => (
              <div key={i}>{ttl}</div>
            ))}
          </div>
          <div className={styles.tBody}>
            {players.map((result) => (
              <div className={styles.row} key={result.golfPlayerId}>
                <div>{result.position}</div>
                <div>{result.name}</div>
                <div>{result.toParPoints}</div>
                <div>{result.thru}</div>
                <div>{result.pickCount}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="not-found">
          Sorry, there are no statistics for <span>the current tournament</span>{' '}
          yet
        </p>
      )}
    </>
  )
}
