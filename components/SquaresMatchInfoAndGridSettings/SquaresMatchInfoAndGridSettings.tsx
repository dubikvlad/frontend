import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect } from 'react'

import { ConvertToPDF, Pencil, Settings } from '@/assets/icons'
import {
  generateParticipantImagePath,
  dateFormattingEvent,
  getHourAndMinute,
  handlingDeadline,
  routes,
} from '@/config/constants'
import { useGetUserInfo, useGrid, usePool } from '@/helpers'

import styles from './SquaresMatchInfoAndGridSettings.module.scss'

export type SquaresMatchInfoAndGridSettingsProps = {
  gridActiveItem: null | 'convert-to-pdf' | 'grid-settings' | 'edit-picks'
  setGridActiveItem: Dispatch<
    SetStateAction<SquaresMatchInfoAndGridSettingsProps['gridActiveItem']>
  >
  customGridId?: number | null
  isNotMakePick?: boolean
}

export function SquaresMatchInfoAndGridSettings({
  gridActiveItem,
  setGridActiveItem,
  customGridId,
  isNotMakePick = false,
}: SquaresMatchInfoAndGridSettingsProps) {
  const {
    query: { poolId, grid_id },
  } = useRouter()

  const gridId = customGridId ?? (grid_id ? Number(grid_id) : undefined)

  useEffect(() => {
    setGridActiveItem(null)
  }, [gridId, setGridActiveItem])

  const { userInfoData } = useGetUserInfo()
  const { poolData } = usePool(Number(poolId))
  const { gridData } = useGrid<'squares'>({
    poolId: poolData?.type === 'squares' ? poolData.id : undefined,
    gridId: gridId,
  })

  if (!poolData || !gridData || !userInfoData) return null

  const isCommissioner = poolData.owner.id === userInfoData.id

  const participant1ImgSrc = generateParticipantImagePath(
    gridData.x_axis_participant.external_id,
  )

  const participant2ImgSrc = generateParticipantImagePath(
    gridData.y_axis_participant.external_id,
  )

  const eventScopes = gridData.event.scopes ?? []

  const homeParticipant = gridData.event.participants.find(
    (item) => item.pivot?.type === 'home',
  )
  const awayParticipant = gridData.event.participants.find(
    (item) => item.pivot?.type === 'away',
  )

  const eventScopesResults =
    homeParticipant && awayParticipant && gridData.event.status === 'finished'
      ? {
          home: {
            title: homeParticipant.name.slice(0, 3).toUpperCase(),
            results: eventScopes
              .filter((item) => item.type !== 'fe')
              .map((item) => ({
                title: item.type === 'fe' ? 'T' : parseInt(item.type),
                score: item.score_home,
              })),
            finalResult: eventScopes.find((item) => item.type === 'fe')
              ?.score_home,
          },
          away: {
            title: awayParticipant.name.slice(0, 3).toUpperCase(),
            results: eventScopes
              .filter((item) => item.type !== 'fe')
              .map((item) => ({
                title: item.type === 'fe' ? 'T' : parseInt(item.type),
                score: item.score_away,
              })),
            finalResult: eventScopes.find((item) => item.type === 'fe')
              ?.score_away,
          },
        }
      : undefined

  return (
    <div className={styles.matchInfoWrapper}>
      <div
        className={classNames(styles.matchInfo, {
          [styles.matchInfoResults]: !!eventScopesResults,
        })}
      >
        <div className={styles.eventWrapper}>
          <div className={styles.eventParticipantImg}>
            <div>
              {participant1ImgSrc && (
                <Image
                  src={participant1ImgSrc}
                  width={100}
                  height={100}
                  alt={gridData.x_axis_participant.name}
                />
              )}
            </div>
            <div>
              {participant2ImgSrc && (
                <Image
                  src={participant2ImgSrc}
                  width={100}
                  height={100}
                  alt={gridData.y_axis_participant.name}
                />
              )}
            </div>
          </div>

          <div className={styles.eventParticipantInfo}>
            <p className={styles.participants}>
              <span>{gridData.x_axis_participant.name}</span> vs{' '}
              <span>{gridData.y_axis_participant.name}</span>
            </p>

            <p className={styles.eventStartDate}>
              <span>{dateFormattingEvent(gridData.event.start_date)}</span>
              <span>{getHourAndMinute(gridData.event.start_date)}</span>
            </p>
          </div>
        </div>

        <div className={styles.deadlineWrapper}>
          <div className={styles.deadlineContainer}>
            {eventScopesResults ? (
              <div className={styles.eventResultWrapper}>
                <div className={styles.eventResultText}>
                  <div></div>
                  <div className={styles.eventScopeResult}>
                    {Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <p key={i}>{i + 1}</p>
                      ))}
                  </div>
                  <p>T</p>
                </div>

                <div>
                  <div>{eventScopesResults.home.title}</div>
                  <div className={styles.eventScopeResult}>
                    {eventScopesResults.home.results.map((item) => (
                      <p key={item.title}>{item.score}</p>
                    ))}
                  </div>
                  <p>{eventScopesResults.home.finalResult}</p>
                </div>

                <div>
                  <div>{eventScopesResults.away.title}</div>
                  <div className={styles.eventScopeResult}>
                    {eventScopesResults.away.results.map((item) => (
                      <p key={item.title}>{item.score}</p>
                    ))}
                  </div>
                  <p>{eventScopesResults.away.finalResult}</p>
                </div>
              </div>
            ) : gridData.is_show_axis_numbers ? (
              <p className={styles.gridBlockedText}>
                Grid blocked by commissioner
              </p>
            ) : (
              <>
                <p className={styles.deadlineText}>Deadline</p>
                <p className={styles.deadlineTime}>
                  {handlingDeadline(gridData.event.start_date)}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.gridSettingsWrapper}>
        {!!gridId && (
          <Link
            className={classNames(styles.convertToPdf, {
              [styles.gridActiveItem]: gridActiveItem === 'convert-to-pdf',
            })}
            href={routes.account.grid.pdf(poolData.id, { grid_id: gridId })}
          >
            <ConvertToPDF /> <p>Convert to PDF</p>
          </Link>
        )}
        {!isNotMakePick ? (
          <div
            className={classNames(styles.gridSettings, {
              [styles.gridActiveItem]: gridActiveItem === 'grid-settings',
              [styles.gridSettingsDisabled]: !isCommissioner,
            })}
            onClick={() => {
              if (setGridActiveItem) {
                setGridActiveItem((prev) =>
                  prev === 'grid-settings' ? null : 'grid-settings',
                )
              }
            }}
          >
            <Settings /> <p>Grid Settings</p>
          </div>
        ) : (
          !!gridId && (
            <Link
              className={classNames(styles.editPicks, {
                [styles.gridActiveItem]: gridActiveItem === 'edit-picks',
              })}
              href={routes.account.makePick.index(poolData.id, {
                grid_id: gridId,
              })}
            >
              <Pencil /> <p>Edit Picks</p>
            </Link>
          )
        )}
      </div>
    </div>
  )
}
