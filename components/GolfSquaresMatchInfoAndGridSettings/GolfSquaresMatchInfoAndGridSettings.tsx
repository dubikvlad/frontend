import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction } from 'react'

import { ConvertToPDF, Pencil, Settings } from '@/assets/icons'
import { golfTournamentLogo } from '@/assets/img'
import {
  dateFormattingEvent,
  getHourAndMinute,
  handlingDeadline,
  routes,
} from '@/config/constants'
import { useGetUserInfo, useGrid, usePool } from '@/helpers'

import styles from './GolfSquaresMatchInfoAndGridSettings.module.scss'

export type GolfSquaresMatchInfoAndGridSettingsProps = {
  gridActiveItem: null | 'convert-to-pdf' | 'grid-settings' | 'edit-picks'
  setGridActiveItem: Dispatch<
    SetStateAction<GolfSquaresMatchInfoAndGridSettingsProps['gridActiveItem']>
  >
  customGridId?: number | null
  isNotMakePick?: boolean
}

export function GolfSquaresMatchInfoAndGridSettings({
  gridActiveItem,
  setGridActiveItem,
  customGridId,
  isNotMakePick = false,
}: GolfSquaresMatchInfoAndGridSettingsProps) {
  const {
    query: { poolId, grid_id },
  } = useRouter()

  const gridId = customGridId ?? (grid_id ? Number(grid_id) : undefined)

  const { userInfoData } = useGetUserInfo()
  const { poolData } = usePool(Number(poolId))
  const { gridData } = useGrid<'golf_squares'>({
    poolId: poolData?.id,
    gridId: gridId,
  })

  const isCommissioner = poolData?.is_commissioner

  if (!poolData || !gridData || !userInfoData || !gridData.golf_tournament)
    return null

  return (
    <div className={styles.matchInfoWrapper}>
      <div className={classNames(styles.matchInfo)}>
        <div className={styles.eventWrapper}>
          <div className={styles.tournament}>
            <div>
              <Image
                alt={gridData.golf_tournament.name}
                src={golfTournamentLogo}
              />
            </div>
            <div>
              <div className={styles.tournamentTitle}>
                {gridData.golf_tournament.name}
              </div>
              <div>
                {dateFormattingEvent(gridData.golf_tournament.start_date) + ' '}
                {getHourAndMinute(gridData.golf_tournament.start_date)}
              </div>
            </div>
          </div>
          <div className={styles.deadlineWrapper}>
            <div className={styles.deadlineContainer}>
              <div className={styles.deadlineText}>Deadline</div>
              <div className={styles.deadlineTime}>
                {handlingDeadline(gridData.golf_tournament.start_date)}
              </div>
            </div>
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
