import classNames from 'classnames'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { api, InitialGridSettingsData, Pool } from '@/api'
import { MonthRightArrow } from '@/assets/icons'
import { RHFSelect } from '@/features/ui'

import styles from './SquaresSeriesGameSettings.module.scss'

type SeriesDefaultValues = {
  number_of_squares: null | 100 | 50 | 25
  game_series_optgroup_name: string
  game_series_optgroup_value: string
  max_squares_per_member: string
  assignment: string
  number_of_sets: string
  master_grid: string
  populate_square?: string
}

const seriesDefaultValues: SeriesDefaultValues = {
  number_of_squares: null,
  game_series_optgroup_name: '', // https://prnt.sc/MUA7Uz38b3KK
  game_series_optgroup_value: '', // https://prnt.sc/qtUi8H4DzqoA
  max_squares_per_member: '',
  assignment: '',
  number_of_sets: '',
  master_grid: '',
}

export { seriesDefaultValues }
export type { SeriesDefaultValues }

type SeriesGameSettingsProps = {
  settingsData: InitialGridSettingsData['settings']
  poolData: Pool<'squares'>
  setSeriesData?: Dispatch<SetStateAction<Partial<SeriesDefaultValues>>>
  setGenerateGridError: Dispatch<SetStateAction<string | null>>
  redirectToMakePick: (value: number) => void
  fullSize?: boolean
}

export function SquaresSeriesGameSettings({
  settingsData,
  poolData,
  setSeriesData,
  setGenerateGridError,
  redirectToMakePick,
  fullSize = false,
}: SeriesGameSettingsProps) {
  const { control, setValue, watch, handleSubmit } =
    useForm<SeriesDefaultValues>({
      defaultValues: seriesDefaultValues,
    })

  const watchFields = useWatch<SeriesDefaultValues>({ control })

  useEffect(() => {
    if (setSeriesData) setSeriesData(watchFields)
  }, [watchFields, setSeriesData])

  // number of squares
  const numberOfSquaresField = settingsData.fields.find(
    (item) => item.name === 'number_of_squares',
  )

  const numberOfSquaresFieldOptions = useMemo(
    () =>
      numberOfSquaresField?.field?.type === 'select' &&
      'options' in numberOfSquaresField?.field
        ? numberOfSquaresField.field.options.map((item) => ({
            title: String(item.title),
            name: String(item.name),
          }))
        : [],
    [numberOfSquaresField],
  )

  const numberOfSquares = watch('number_of_squares')

  useEffect(() => {
    if (numberOfSquaresFieldOptions.length) {
      const value = Number(numberOfSquaresFieldOptions[0].name)
      if (value === 100 || value === 50 || value === 25) {
        setValue('number_of_squares', value)
      }
    }
  }, [numberOfSquaresFieldOptions, setValue])

  // game_series_optgroup_name => game series tabs (optgroups)
  const gameSeriesField = settingsData.fields.find(
    (item) => item.name === 'game_series',
  )

  const gameSeriesFieldTabs = useMemo(
    () =>
      gameSeriesField?.field?.type === 'select' &&
      'optgroups' in gameSeriesField?.field
        ? gameSeriesField.field.optgroups
        : [],
    [gameSeriesField],
  )

  const gameSeriesOptgroupName = watch('game_series_optgroup_name')

  useEffect(() => {
    if (gameSeriesFieldTabs.length) {
      setValue('game_series_optgroup_name', String(gameSeriesFieldTabs[0].name))
    }
  }, [gameSeriesFieldTabs, setValue])

  // game_series_optgroup_value => game series options
  const gameSeriesFieldOptions = useMemo(
    () =>
      gameSeriesFieldTabs.find((item) => item.name === gameSeriesOptgroupName)
        ?.options ?? [],
    [gameSeriesFieldTabs, gameSeriesOptgroupName],
  )

  useEffect(() => {
    if (gameSeriesFieldOptions.length) {
      setValue(
        'game_series_optgroup_value',
        String(gameSeriesFieldOptions[0].name),
      )
    }
  }, [gameSeriesFieldOptions, setValue])

  // squares per member
  const squaresPerMemberField = settingsData.fields.find(
    (item) => item.name === 'max_squares_per_member',
  )

  const squaresPerMemberFieldOptions = useMemo(
    () =>
      squaresPerMemberField?.field?.type === 'select' &&
      'options' in squaresPerMemberField?.field
        ? squaresPerMemberField.field.options.map((item) => ({
            title: String(item.title),
            name: String(item.name),
          }))
        : [],
    [squaresPerMemberField],
  )

  useEffect(() => {
    if (squaresPerMemberFieldOptions.length) {
      setValue('max_squares_per_member', squaresPerMemberFieldOptions[0].name)
    }
  }, [squaresPerMemberFieldOptions, setValue])

  // numbers on the grid are
  const assignmentField = settingsData.fields.find(
    (item) => item.name === 'assignment',
  )

  const assignmentFieldOptions = useMemo(
    () =>
      assignmentField?.field?.type === 'select' &&
      'options' in assignmentField?.field
        ? assignmentField.field.options.map((item) => ({
            title: String(item.title),
            name: String(item.name),
          }))
        : [],
    [assignmentField],
  )

  useEffect(() => {
    if (assignmentFieldOptions.length) {
      setValue('assignment', String(assignmentFieldOptions[0].name))
    }
  }, [assignmentFieldOptions, setValue])

  // number of sets
  const numberOfSetsField = settingsData.fields.find(
    (item) => item.name === 'number_of_sets',
  )

  const numberOfSetsFieldOptions = useMemo(
    () =>
      numberOfSetsField?.field?.type === 'select' &&
      'options' in numberOfSetsField?.field
        ? numberOfSetsField.field.options.map((item) => ({
            title: String(item.title),
            name: String(item.name),
          }))
        : [],
    [numberOfSetsField],
  )

  const numberOfSets = watch('number_of_sets')

  useEffect(() => {
    if (numberOfSetsFieldOptions.length) {
      setValue('number_of_sets', numberOfSetsFieldOptions[0].name)
    }
  }, [numberOfSetsFieldOptions, setValue])

  // master grid
  const masterGridField = settingsData.fields.find(
    (item) => item.name === 'master_grid',
  )

  const masterGridFieldOptions = useMemo(
    () =>
      masterGridField?.field?.type === 'select' &&
      'options' in masterGridField?.field
        ? masterGridField.field.options.map((item) => ({
            title: String(item.title),
            name: String(item.name),
          }))
        : [],
    [masterGridField],
  )

  useEffect(() => {
    if (masterGridFieldOptions.length) {
      setValue('master_grid', String(masterGridFieldOptions[0].name))
    }
  }, [masterGridFieldOptions, setValue])

  const [isLoading, setIsLoading] = useState(false)

  async function generateGrid(data: typeof seriesDefaultValues) {
    setIsLoading(true)

    try {
      const res = await api.pools.gridsAdd<'series'>(poolData.id, {
        assignment: data.assignment,
        game_series: `${data.game_series_optgroup_name}|${data.game_series_optgroup_value}`,
        game_series_optgroup_name: data.game_series_optgroup_name,
        game_series_optgroup_value: data.game_series_optgroup_value,
        grid_type: 'series',
        master_grid: data.master_grid,
        max_squares_per_member: data.max_squares_per_member,
        number_of_sets: Number(data.number_of_sets),
        number_of_squares: Number(data.number_of_squares),
      })

      if (res.error && setGenerateGridError) {
        if ('message' in res.error) {
          setGenerateGridError(res.error.message)
        }

        if ('messages' in res.error) {
          setGenerateGridError(res.error.getFirstMessage())
        }

        setIsLoading(false)
        return
      }

      setIsLoading(false)
      res.data?.grid_id && redirectToMakePick(res.data.grid_id)
    } catch (err) {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.settings}>
      <div
        className={classNames(styles.firstRowSettingWrapper, {
          [styles.withSelect]: fullSize,
        })}
      >
        {!!numberOfSquaresFieldOptions.length && (
          <div className={styles.numberOfSquaresWrapper}>
            {numberOfSquaresFieldOptions.map((item) => (
              <p
                key={item.name}
                className={classNames({
                  [styles.numberOfSquaresActiveItem]:
                    Number(item.name) === numberOfSquares,
                })}
                onClick={() => {
                  const value = Number(item.name)
                  if (value === 100 || value === 50 || value === 25) {
                    setValue('number_of_squares', value)
                  }
                }}
              >
                <span>{item.title}</span> Squares on grid
              </p>
            ))}
          </div>
        )}

        {fullSize && !!numberOfSetsFieldOptions.length && (
          <div className={styles.gridSizeSelectWrapper}>
            <RHFSelect
              control={control}
              name="number_of_sets"
              options={numberOfSetsFieldOptions}
              withLabel
              placeholder="Grid Size"
            />
          </div>
        )}
      </div>

      <div className={styles.twoFields}>
        {!!gameSeriesFieldOptions.length && (
          <div className={styles.seriesFields}>
            <div className={styles.gameSeriesNameWrapper}>
              {gameSeriesFieldTabs.map((item) => (
                <div
                  key={item.name}
                  className={classNames(styles.gameSeriesName, {
                    [styles.gameSeriesNameActive]:
                      gameSeriesOptgroupName === item.name,
                  })}
                  onClick={() =>
                    setValue('game_series_optgroup_name', item.name)
                  }
                >
                  <MonthRightArrow />
                  <p>{item.title}</p>
                </div>
              ))}
            </div>

            {!!gameSeriesFieldOptions.length && (
              <div>
                <RHFSelect
                  control={control}
                  name="game_series_optgroup_value"
                  options={gameSeriesFieldOptions}
                  withLabel
                  placeholder="Series"
                />
              </div>
            )}
          </div>
        )}

        <RHFSelect
          control={control}
          name="max_squares_per_member"
          options={squaresPerMemberFieldOptions}
          withLabel
          placeholder="Squares per member"
        />
      </div>

      <div className={styles.twoFields}>
        <RHFSelect
          control={control}
          name="master_grid"
          withLabel
          placeholder="Master Grid"
          options={masterGridFieldOptions}
        />

        <RHFSelect
          control={control}
          name="assignment"
          withLabel
          placeholder="Numbers on the grid are"
          options={assignmentFieldOptions}
        />
      </div>

      {numberOfSetsFieldOptions.length && !fullSize && (
        <div className={styles.numberOfSetsWrapper}>
          {numberOfSetsFieldOptions.map((item) => (
            <p
              key={item.name}
              className={classNames({
                [styles.numberOfSetsActiveItem]:
                  item.name === String(numberOfSets),
              })}
              onClick={() => setValue('number_of_sets', item.name)}
            >
              <span>{item.name}</span> set of numbers{' '}
              {String(item.name) === '1' && (
                <span className={styles.hint}>(recommended)</span>
              )}
              {String(item.name) === '4' && (
                <span className={styles.hint}>(one for each quarter)</span>
              )}
            </p>
          ))}
        </div>
      )}

      <button
        className={classNames(
          'button button-blue-light',
          styles.generateGridBtn,
          { disabled: isLoading },
          { [styles.wide]: fullSize },
        )}
        onClick={handleSubmit(generateGrid)}
      >
        Generate Grid
      </button>
    </div>
  )
}
