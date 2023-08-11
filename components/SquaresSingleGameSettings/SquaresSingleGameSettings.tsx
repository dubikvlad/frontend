import classNames from 'classnames'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { InitialGridSettingsData, Pool, api } from '@/api'
import { RHFInput, RHFSelect } from '@/features/ui'
import { Switcher } from '@/features/ui'

import { FilterByWeekNumber } from '../FilterByWeekNumber'

import styles from './SquaresSingleGameSettings.module.scss'

type SingleFormData = {
  number_of_squares: 100 | 50 | 25 | null
  week_of_game: string
  name: string
  max_squares_per_member: string
  game_for_week: string
  assignment: string
  number_of_sets: string
  tournament_id?: string
  populate_square?: number
}

const singleDefaultValues: SingleFormData = {
  number_of_squares: null,
  week_of_game: '',
  name: '',
  max_squares_per_member: '',
  game_for_week: '',
  assignment: '',
  number_of_sets: '',
}

export { singleDefaultValues }
export type { SingleFormData }

type SingleGameSettingsProps = {
  settingsData: InitialGridSettingsData['settings']
  poolData: Pool<'squares'>
  setSingleData?: Dispatch<SetStateAction<Partial<SingleFormData>>>
  setGenerateGridError: Dispatch<SetStateAction<string | null>>
  redirectToMakePick: (value: number) => void
  fullSize?: boolean
}

export function SquaresSingleGameSettings({
  settingsData,
  poolData,
  setSingleData,
  setGenerateGridError,
  redirectToMakePick,
  fullSize = false,
}: SingleGameSettingsProps) {
  const { control, setValue, watch, handleSubmit } = useForm<SingleFormData>({
    defaultValues: singleDefaultValues,
  })

  const [copySquaresSwitcher, setCopySquaresSwitcher] = useState(false)

  const watchFields = useWatch<SingleFormData>({ control })

  useEffect(() => {
    if (setSingleData) setSingleData(watchFields)
  }, [watchFields, setSingleData])

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

  // grid name
  const gridNameField = settingsData.fields.find((item) => item.name === 'name')

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

  // week
  const weekOfGameField = settingsData.fields.find(
    (item) => item.name === 'week_of_game',
  )

  const weekOfGameFieldOptions = useMemo(
    () =>
      weekOfGameField?.field?.type === 'select' &&
      'options' in weekOfGameField?.field
        ? weekOfGameField.field.options.map((item) => ({
            title: String(item.title),
            name: String(item.name),
            gameForWeek: item.child_options,
          }))
        : [],
    [weekOfGameField],
  )

  useEffect(() => {
    if (weekOfGameFieldOptions.length) {
      setValue('week_of_game', String(weekOfGameFieldOptions[0].name))
    }
  }, [weekOfGameFieldOptions, setValue])

  // available weeks

  const weeks = useMemo(() => {
    if (poolData.available_week.includes(poolData.pick_pool.current_week)) {
      const currentWeekIndex = poolData.available_week.indexOf(
        poolData.pick_pool.current_week,
      )
      return poolData.available_week.slice(currentWeekIndex + 1)
    } else {
      return poolData.available_week
    }
  }, [poolData])

  // game for week
  const weekOfGame = watch('week_of_game')

  const gameForWeekOptions = useMemo(
    () =>
      weekOfGameFieldOptions.length && weekOfGame
        ? weekOfGameFieldOptions.find(
            (item) => item.name === String(weekOfGame),
          )?.gameForWeek ?? []
        : [],
    [weekOfGame, weekOfGameFieldOptions],
  )

  useEffect(() => {
    if (gameForWeekOptions.length) {
      setValue('game_for_week', String(gameForWeekOptions[0].name))
    }
  }, [gameForWeekOptions, setValue])

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

  const tournamentIdField = settingsData.fields.find(
    (field) => field.name === 'tournament_id',
  )

  const tournamentIdFieldOptions = useMemo(
    () =>
      tournamentIdField?.field?.type === 'select' &&
      'options' in tournamentIdField?.field
        ? tournamentIdField.field.options.map((item) => ({
            title: String(item.title),
            name: String(item.name),
          }))
        : [],
    [tournamentIdField?.field],
  )
  useEffect(() => {
    if (tournamentIdFieldOptions.length) {
      setValue('tournament_id', tournamentIdFieldOptions[0].name)
    }
  }, [setValue, tournamentIdFieldOptions])
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

  // Copied from and controlled by existing
  const populateSquare = settingsData.fields.find(
    (item) => item.name === 'populate_square',
  )

  const populateSquareDependentFieldOptions = useMemo(
    () =>
      populateSquare?.dependent_field?.field.options
        ? populateSquare.dependent_field.field.options.map((option) => {
            return {
              title: option.title,
              name: String(option.name),
            }
          })
        : [],
    [populateSquare],
  )

  useEffect(() => {
    if (populateSquareDependentFieldOptions.length) {
      const value = populateSquareDependentFieldOptions[0].name
      if (copySquaresSwitcher) {
        setValue('populate_square', Number(value))
      } else setValue('populate_square', 0)
    }
  }, [populateSquareDependentFieldOptions, setValue, copySquaresSwitcher])

  const [isLoading, setIsLoading] = useState(false)

  async function generateGrid(data: typeof singleDefaultValues) {
    setIsLoading(true)

    try {
      const res = await api.pools.gridsAdd(poolData.id, {
        assignment: data.assignment,
        event_id: String(data.game_for_week),
        grid_type: 'single',
        max_squares_per_member: data.max_squares_per_member,
        name: data.name,
        number_of_sets: data.number_of_sets,
        number_of_squares: data.number_of_squares
          ? String(data.number_of_squares)
          : '100',
        week_of_game: String(data.week_of_game),
        tournament_id: String(data.tournament_id),
        populate_square: data.populate_square ?? 0,
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
        {fullSize && numberOfSetsFieldOptions.length && (
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

      {!!(gridNameField || squaresPerMemberFieldOptions.length) && (
        <div className={styles.nameAndSquaresMemberWrapper}>
          <div>
            {!!gridNameField && (
              <RHFInput
                control={control}
                name="name"
                placeholder="Grid Name (optional)"
                withLabel
              />
            )}
          </div>

          <div>
            {!!squaresPerMemberFieldOptions.length && (
              <RHFSelect
                control={control}
                name="max_squares_per_member"
                options={squaresPerMemberFieldOptions}
                withLabel
                placeholder="Squares per member"
              />
            )}
          </div>
        </div>
      )}

      {!!gameForWeekOptions.length && (
        <div
          className={classNames(styles.weekOfGameWrapper, {
            [styles.full]: fullSize,
          })}
        >
          <FilterByWeekNumber
            control={control}
            name="week_of_game"
            availableWeeks={weeks}
            slidesInSlider={fullSize ? 11 : 0}
          />
        </div>
      )}

      {!!(gameForWeekOptions.length || assignmentFieldOptions.length) && (
        <div className={styles.gameForWeekAndNumbersWrapper}>
          {!!tournamentIdFieldOptions.length && (
            <div>
              <RHFSelect
                control={control}
                placeholder="Tournament"
                name="tournament_id"
                options={tournamentIdFieldOptions}
                withLabel
              />
            </div>
          )}
          {!!gameForWeekOptions.length && (
            <div>
              <RHFSelect
                control={control}
                placeholder="Game for Grid"
                name="game_for_week"
                withLabel
                options={gameForWeekOptions}
              />
            </div>
          )}
          {!!assignmentFieldOptions.length && (
            <div>
              <RHFSelect
                control={control}
                placeholder="Numbers on the grid are"
                name="assignment"
                options={assignmentFieldOptions}
                withLabel
              />
            </div>
          )}
        </div>
      )}

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

      {!!populateSquare && !!populateSquareDependentFieldOptions.length && (
        <div className={styles.checkboxContainerWrapper}>
          <div className={styles.switcherWrapper}>
            <Switcher
              value={copySquaresSwitcher}
              onChange={setCopySquaresSwitcher}
            />
            <p>Copy squares and control from existing one</p>
          </div>
          {copySquaresSwitcher && (
            <div className={styles.gridSizeSelectWrapper}>
              <RHFSelect
                control={control}
                name="populate_square"
                options={populateSquareDependentFieldOptions}
                withLabel
                placeholder="Copy Grid"
              />
            </div>
          )}
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
