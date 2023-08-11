import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

import { Participant, Pool } from '@/api'
import { GridType, routes } from '@/config/constants'
import {
  seriesDefaultValues,
  SeriesDefaultValues,
} from '@/features/components/SquaresSeriesGameSettings/SquaresSeriesGameSettings'
import {
  SingleFormData,
  singleDefaultValues,
} from '@/features/components/SquaresSingleGameSettings/SquaresSingleGameSettings'
import {
  useGrids,
  useInitialGridSettings,
  useMessage,
  usePool,
  useTeams,
} from '@/helpers'

import styles from './GridAddPage.module.scss'

const SquaresSingleGameSettingsLazy = dynamic(
  () =>
    import(
      '@/features/components/SquaresSingleGameSettings/SquaresSingleGameSettings'
    ).then((mod) => mod.SquaresSingleGameSettings),
  {
    loading: () => <p>Loading...</p>,
  },
)

const SquaresSeriesGameSettingsLazy = dynamic(
  () =>
    import(
      '@/features/components/SquaresSeriesGameSettings/SquaresSeriesGameSettings'
    ).then((mod) => mod.SquaresSeriesGameSettings),
  {
    loading: () => <p>Loading...</p>,
  },
)

const SquaresGridLazy = dynamic(
  () =>
    import('@/features/components/SquaresGrid/SquaresGrid').then(
      (mod) => mod.SquaresGrid,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

export function GridAddPage({
  poolId,
  gridType,
}: {
  poolId: number
  gridType: GridType
}) {
  const { push } = useRouter()

  useEffect(() => {
    if (!gridType || (gridType !== 'single' && gridType !== 'series')) {
      push(routes.account.grid.gettingStarted(poolId))
    }
  }, [gridType, push, poolId])

  const { poolData } = usePool<'squares'>(Number(poolId))
  const { gridsData } = useGrids({
    poolId: poolData?.type === 'squares' ? poolData.id : undefined,
  })

  const { teams } = useTeams({
    poolId: poolData?.type !== 'golf_squares' ? poolId : undefined,
  })

  const {
    initialGridSettingsData,
    initialGridSettingsIsLoading,
    initialGridSettingsError,
  } = useInitialGridSettings({
    poolId,
    gridType,
  })

  useEffect(() => {
    if (!initialGridSettingsIsLoading && initialGridSettingsError && poolId) {
      push(routes.account.overview(poolId))
    }
  }, [initialGridSettingsIsLoading, initialGridSettingsError, poolId, push])

  const [singleData, setSingleData] =
    useState<Partial<SingleFormData>>(singleDefaultValues)
  const [seriesData, setSeriesData] =
    useState<Partial<SeriesDefaultValues>>(seriesDefaultValues)

  const previewWrapperRef = useRef<HTMLDivElement>(null)

  function getTeams() {
    if (gridType === 'series') {
      if (seriesData.game_series_optgroup_value) {
        const foundTeam = teams.find(
          (team) => team.id === Number(seriesData.game_series_optgroup_value),
        )

        if (foundTeam)
          return [
            {
              id: foundTeam.id,
              external_id: foundTeam.external_id,
              name: foundTeam.name,
            },
          ] as Participant[]
      }
    }

    const weekOfGame = initialGridSettingsData?.fields?.find(
      (item) => item.name === 'week_of_game',
    )

    if (weekOfGame && weekOfGame.field.type === 'select') {
      const option =
        'options' in weekOfGame.field
          ? weekOfGame.field.options.find(
              (item) => Number(item.name) === Number(singleData.week_of_game),
            )
          : undefined

      const teams = option?.child_options?.find(
        (item) => Number(item.name) === Number(singleData.game_for_week),
      )

      if (teams) return teams.participants
    }

    return []
  }

  const participants = getTeams()

  const [generateGridError, setGenerateGridError] = useMessage()

  function redirectToMakePick(gridId: number) {
    push(routes.account.makePick.index(poolId, { grid_id: gridId }))
  }

  if (!initialGridSettingsData) return null

  function getSeriesAndMasterGridInfo() {
    const result = {
      gameSeries: '',
      isMasterGrid: false,
    }

    if (gridType !== 'series' || !initialGridSettingsData || !seriesData) {
      return result
    }

    const gameSeries = initialGridSettingsData.fields.find(
      (item) => item.name === 'game_series',
    )

    if (gameSeries) {
      const gameSeriesOptgroup =
        gameSeries.field.type === 'select' && 'optgroups' in gameSeries.field
          ? gameSeries.field.optgroups.find(
              (item) => item.name === seriesData.game_series_optgroup_name,
            )
          : undefined

      if (gameSeriesOptgroup) {
        const gameSeriesOptgroupValue = gameSeriesOptgroup.options.find(
          (item) => String(item.name) === seriesData.game_series_optgroup_value,
        )

        if (gameSeriesOptgroupValue)
          result.gameSeries = gameSeriesOptgroupValue.title
      }
    }

    result.isMasterGrid = seriesData.master_grid === '0'

    return result
  }

  const seriesAndMasterGridInfo = getSeriesAndMasterGridInfo()

  return (
    <div className={styles.wrapper}>
      <h1>
        {gridType === 'single' && 'Add a new grid'}
        {gridType === 'series' && 'Add a series'}
      </h1>

      <div className={styles.addWrapper}>
        <div className={styles.gameSettingsWrapper}>
          <p className={styles.title}>
            {gridType === 'single' && 'SINGLE GAME'}
            {gridType === 'series' && 'GAME SERIES'}
          </p>

          {generateGridError && (
            <div
              className={classNames('alert alert-danger', styles.alertDanger)}
              style={{ marginTop: '15px' }}
            >
              {generateGridError}
            </div>
          )}

          {initialGridSettingsData && poolData && (
            <>
              {gridType === 'single' && (
                <SquaresSingleGameSettingsLazy
                  settingsData={initialGridSettingsData}
                  poolData={poolData as unknown as Pool<'squares'>}
                  setSingleData={setSingleData}
                  setGenerateGridError={setGenerateGridError}
                  redirectToMakePick={redirectToMakePick}
                />
              )}

              {gridType === 'series' && (
                <SquaresSeriesGameSettingsLazy
                  settingsData={initialGridSettingsData}
                  poolData={poolData as unknown as Pool<'squares'>}
                  setSeriesData={setSeriesData}
                  setGenerateGridError={setGenerateGridError}
                  redirectToMakePick={redirectToMakePick}
                />
              )}
            </>
          )}
        </div>

        <div className={styles.previewWrapper} ref={previewWrapperRef}>
          <p className={styles.previewTitle}>Preview</p>
          {gridType === 'single' && (
            <div className={styles.gridInfo}>
              <div>
                <p>#{gridsData.length + 1}</p>
                <p className={styles.gridName}>
                  {singleData.name?.trim() ? singleData.name : 'Grid name'}
                </p>
              </div>
              {singleData.week_of_game ? (
                <p>Week {singleData.week_of_game}</p>
              ) : (
                <></>
              )}
            </div>
          )}
          {gridType === 'series' && (
            <div className={styles.seriesGridInfo}>
              <p>{seriesAndMasterGridInfo.gameSeries}</p>
              <p>{seriesAndMasterGridInfo.isMasterGrid && 'Master Grid'}</p>
            </div>
          )}
          {singleData?.number_of_sets && Number(singleData.number_of_sets) > 1 && (
            <div className={styles.numberOfSetsWrapper}>
              <p className={styles.numberOfSetsActive}>Total</p>
              {Array(Number(singleData.number_of_sets))
                .fill(0)
                .map((_, i) => (
                  <p key={i}>Quarter {i + 1}</p>
                ))}
            </div>
          )}

          {gridType === 'single' && !!singleData?.number_of_sets && (
            <SquaresGridLazy
              wrapperRef={previewWrapperRef}
              customNumberOfSets={Number(singleData.number_of_sets)}
              customSquaresOnGrid={singleData.number_of_squares ?? 100}
              isPreview
              xCustomTeam={participants[0]}
              yCustomTeam={participants[1]}
              isGolf={poolData?.type === 'golf_squares'}
            />
          )}

          {gridType === 'series' && !!seriesData?.number_of_sets && (
            <SquaresGridLazy
              wrapperRef={previewWrapperRef}
              customNumberOfSets={Number(seriesData.number_of_sets)}
              customSquaresOnGrid={seriesData.number_of_squares ?? 100}
              isPreview
              xCustomTeam={participants[0]}
              isGolf={poolData?.type === 'golf_squares'}
            />
          )}
        </div>
      </div>
    </div>
  )
}
