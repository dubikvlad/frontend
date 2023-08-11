import classNames from 'classnames'
import Image from 'next/image'

import { api, PoolData } from '@/api'
import { Members } from '@/assets/icons'
import { leaguesByPoolTypeById } from '@/config/constants'
import { stringifyMonth, useAdaptiveBreakpoints } from '@/helpers'

import styles from './MyPoolsTableLike.module.scss'

type MyPoolsTableLike = {
  poolsData: PoolData[]
  poolsMutate: () => void
}

export function MyPoolsTableLike({ poolsData, poolsMutate }: MyPoolsTableLike) {
  const { breakpoint } = useAdaptiveBreakpoints(['sm'])

  function returnDate(data: Date) {
    const date = new Date(data)

    return `${stringifyMonth({
      month: date.getMonth(),
    })} ${date.getDate()}, ${date.getFullYear()}`
  }

  async function sendJoinRequest(poolId: number) {
    await api.pools.requestToJoin(Number(poolId))
    poolsMutate()
  }

  return (
    <div className={styles.like}>
      <h3 className={styles.likeTitle}>You May Also Like</h3>
      <div className={styles.tableWrapper}>
        {poolsData.map((pool, i) => {
          if (breakpoint === 'sm') {
            return (
              <div key={i} className={styles.rowSm}>
                <div className={styles.top}>
                  <div className={styles.left}>
                    <div className={styles.imgWrap}>
                      {leaguesByPoolTypeById[pool.pool_type.tournament_id] && (
                        <Image
                          src={
                            leaguesByPoolTypeById[pool.pool_type.tournament_id]
                              .src
                          }
                          alt={pool.pool_type.title}
                          width={0}
                          height={0}
                          sizes="100vw"
                          style={{ width: '100%', height: 'auto' }}
                        />
                      )}
                    </div>
                    <div className={styles.poolName}>
                      <div className={styles.poolNameInfo}>
                        <span>{pool.name}</span>{' '}
                        <span>{pool.pool_type.title}</span>
                      </div>
                      <p className={styles.ownerName}>
                        Commissioner: {pool.owner.username}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.bottom}>
                  <div className={styles.entries}>
                    <p className={styles.title}>Entries:</p>
                    <div>
                      <Members className={styles.entriesIcon} />

                      <p
                        dangerouslySetInnerHTML={{
                          __html:
                            pool.pool_type.type !== 'squares' &&
                            pool.pool_type.type !== 'golf_squares'
                              ? `${pool.entries_count}/${
                                  pool.max_entries ?? '&#8734;'
                                } spots`
                              : '',
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.startDate}>
                    <p className={styles.title}>Start date:</p>
                    <p>{returnDate(pool.created_at)}</p>
                  </div>
                </div>

                <div className={styles.bottomActions}>
                  {pool?.waiting ? (
                    <button
                      disabled
                      className={classNames(
                        'button button-orange',
                        styles.button,
                      )}
                    >
                      Pending
                    </button>
                  ) : (
                    <button
                      onClick={() => sendJoinRequest(pool.id)}
                      className={classNames(
                        'button button-blue-light',
                        styles.button,
                      )}
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            )
          }

          return (
            <div key={i} className={styles.tableRow}>
              <div className={styles.name}>
                <div>
                  {leaguesByPoolTypeById[pool.pool_type.tournament_id] && (
                    <Image
                      src={
                        leaguesByPoolTypeById[pool.pool_type.tournament_id].src
                      }
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: '100%', height: 'auto' }}
                      alt={pool.pool_type.title}
                    />
                  )}
                </div>
                <div className={styles.poolName}>
                  <div className={styles.poolNameInfo}>
                    <span>{pool.name}</span> <span>{pool.pool_type.title}</span>
                  </div>
                </div>
              </div>
              <div
                className={classNames(styles.text, styles.membersText)}
                dangerouslySetInnerHTML={{
                  __html:
                    pool.pool_type.type !== 'squares' &&
                    pool.pool_type.type !== 'golf_squares'
                      ? `${pool.entries_count}/${
                          pool.max_entries ?? '&#8734;'
                        } spots`
                      : '',
                }}
              />
              <div className={styles.text}>{returnDate(pool.created_at)}</div>
              <div className={styles.text}>{pool.owner.username}</div>
              <div className={classNames(styles.endText, styles.centered)}>
                {pool?.waiting ? (
                  <button
                    disabled
                    className={classNames(
                      'button button-blue-light',
                      styles.button,
                    )}
                  >
                    Pending
                  </button>
                ) : (
                  <button
                    onClick={() => sendJoinRequest(pool.id)}
                    className={classNames(
                      'button button-blue-light',
                      styles.button,
                    )}
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
