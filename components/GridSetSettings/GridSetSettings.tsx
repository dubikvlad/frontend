import classNames from 'classnames'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useForm, FieldValues } from 'react-hook-form'

import { api, InitialGridSettingsData, SettingsFieldCustomField } from '@/api'
import { BottomArrow } from '@/assets/icons'
import { routes } from '@/config/constants'
import { HorizontalFilterByWeek4, InfoContainer } from '@/features/components'
import { RHFInput, RHFSelect, RHFSwitcher, Switcher } from '@/features/ui'
import { useGetGridSettings, useGrid, useMessage, useGrids } from '@/helpers'

import styles from './GridSetSettings.module.scss'
import { Selectors } from './Selectors'

type SingleGameSettingsProps = {
  settingsData: InitialGridSettingsData['settings'] | undefined
  setGenerateGridError?: Dispatch<SetStateAction<string | null>>
  customGridId?: number | null
  closeSettings: () => void
}

export function GridSetSettings({
  settingsData,
  customGridId,
  closeSettings,
}: SingleGameSettingsProps) {
  const [showXAxis, setshowXAxis] = useState(true)
  const [showYAxis, setShowYAxis] = useState(true)
  const [showDelete, setShowDelete] = useState(false)

  const { control, setValue, watch, getValues, handleSubmit, unregister } =
    useForm<FieldValues>()

  const assignmentValue = watch('assignment')
  const numberOfSetsValue = watch('number_of_sets')

  const router = useRouter()
  const {
    query: { grid_id, poolId },
  } = useRouter()
  const { gridsData } = useGrids({ poolId: Number(poolId) })

  const gridId = customGridId ?? grid_id

  const { gridSettingsMutate } = useGetGridSettings({
    poolId: Number(poolId),
    gridId: gridId ? Number(gridId) : undefined,
  })

  const { gridData } = useGrid({
    poolId: Number(poolId),
    gridId: gridId ? Number(gridId) : undefined,
  })

  const passedDeadline = gridData?.deadline_passed

  const [generateGridError, setGenerateGridError] = useMessage()

  // number of squares
  const numberOfSquaresField =
    settingsData &&
    settingsData.fields.find((item) => item.name === 'number_of_squares')

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
    if (numberOfSquaresField && !passedDeadline) {
      const value =
        numberOfSquaresField &&
        'value' in numberOfSquaresField.field &&
        numberOfSquaresField.field.value

      if (value === 100 || value === 50 || value === 25) {
        setValue('number_of_squares', value)
      }
    }
  }, [numberOfSquaresField, setValue, passedDeadline])

  // grid name
  const gridNameField = useMemo(
    () =>
      settingsData && settingsData.fields.find((item) => item.name === 'name'),
    [settingsData],
  )

  // squares per member
  const squaresPerMemberField =
    settingsData &&
    settingsData.fields.find((item) => item.name === 'max_squares_per_member')

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
    if (
      squaresPerMemberFieldOptions.length &&
      !passedDeadline &&
      squaresPerMemberField
    ) {
      setValue(
        'max_squares_per_member',
        !!('value' in squaresPerMemberField.field)
          ? squaresPerMemberField.field.value
          : squaresPerMemberFieldOptions[0].name,
      )
    }
  }, [
    squaresPerMemberFieldOptions,
    setValue,
    passedDeadline,
    squaresPerMemberField,
  ])

  // week
  const weekOfGameField =
    settingsData &&
    settingsData.fields.find((item) => item.name === 'week_of_game')

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
    if (!passedDeadline) {
      if (weekOfGameField?.dependent_field?.field?.value) {
        setValue('event_id', weekOfGameField?.dependent_field.field.value)
        setValue('week_of_game', String(weekOfGameFieldOptions[0].name))
      } else if (weekOfGameFieldOptions.length) {
        setValue('week_of_game', String(weekOfGameFieldOptions[0].name))
      }
    }
  }, [weekOfGameFieldOptions, setValue, weekOfGameField, passedDeadline])
  const weekOfGame = watch('week_of_game')

  // game for grid
  const gameForGridVallue = watch('event_id')

  const gameForGridOptions = useMemo(
    () =>
      weekOfGameFieldOptions.length && weekOfGame
        ? weekOfGameFieldOptions.find(
            (item) => item.name === String(weekOfGame),
          )?.gameForWeek ?? []
        : [],
    [weekOfGame, weekOfGameFieldOptions],
  )

  const teams = gameForGridOptions
    .find((item) => item.name === gameForGridVallue)
    ?.title.split(' - ')

  useEffect(() => {
    if (!passedDeadline) {
      if (
        weekOfGameField?.dependent_field?.field?.value &&
        String(
          !!('value' in weekOfGameField.field) && weekOfGameField.field.value,
        ) === weekOfGame &&
        gameForGridOptions.length
      ) {
        setValue('event_id', weekOfGameField?.dependent_field.field.value)
      } else if (gameForGridOptions.length) {
        setValue('event_id', gameForGridOptions[0].name)
      }
    }
  }, [
    gameForGridOptions,
    weekOfGame,
    weekOfGameField,
    passedDeadline,
    setValue,
  ])

  // numbers on the grid are
  const assignmentField =
    settingsData &&
    settingsData.fields.find((item) => item.name === 'assignment')

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

  //axis fields

  const axisCustomFields =
    assignmentField &&
    'custom_field' in assignmentField.field &&
    assignmentField.field.custom_field?.sort(sortNames)

  function sortNames(a: SettingsFieldCustomField, b: SettingsFieldCustomField) {
    if (a.title > b.title) {
      return 1
    }
    if (a.title < b.title) {
      return -1
    }
    return 0
  }

  // number of sets
  const numberOfSetsField =
    settingsData &&
    settingsData.fields.find((item) => item.name === 'number_of_sets')

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

  useEffect(() => {
    if (numberOfSetsFieldOptions.length && !passedDeadline) {
      setValue('number_of_sets', numberOfSetsFieldOptions[0].name)
    }
  }, [numberOfSetsFieldOptions, setValue, passedDeadline])

  // pickable square

  const isNumberPickableSquare =
    settingsData &&
    settingsData.fields.find(
      (item) => item.name === 'is_number_pickable_square',
    )

  // show axis numbers

  const isShowAxisNumbers =
    settingsData &&
    settingsData.fields.find((item) => item.name === 'is_show_axis_numbers')

  const [isLoading, setIsLoading] = useState(false)

  // grid type

  const [gridTypeStatus, setGridTypeStatus] = useState(false)

  const gridTypeField =
    settingsData &&
    settingsData.fields.find((item) => item.name === 'grid_type')

  const gridTypeFieldValue =
    gridTypeField && 'value' in gridTypeField.field && gridTypeField.field.value

  const gridTypeDependentFieldOptions =
    gridTypeField &&
    'custom_field' in gridTypeField.field &&
    gridTypeField.field.custom_field &&
    gridTypeField.field.custom_field[0].dependent_field?.field.options

  useEffect(() => {
    gridTypeFieldValue === 'Standalone'
      ? setGridTypeStatus(false)
      : String(gridTypeFieldValue).includes('Master')
      ? setGridTypeStatus(false)
      : setGridTypeStatus(true)
  }, [gridTypeFieldValue])

  async function sendData() {
    setIsLoading(true)

    const formValues = getValues()

    try {
      const res = await api.pools.setGridSettings(
        Number(poolId),
        Number(gridId),
        formValues,
      )

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
      gridSettingsMutate()
      setIsLoading(false)
      closeSettings()
    } catch (err) {
      setIsLoading(false)
    }
  }

  async function deleteGrid() {
    try {
      const res = await api.pools.removeGrid(Number(poolId), Number(gridId))

      if (res.error && setGenerateGridError) {
        if ('message' in res.error) {
          setGenerateGridError(res.error.message)
        }

        if ('messages' in res.error) {
          setGenerateGridError(res.error.getFirstMessage())
        }

        return
      }

      if (!res.error && gridsData.length > 1) {
        router.push(routes.account.gridControl(Number(poolId)))
      } else {
        router.push(routes.account.overview(Number(poolId)))
      }
    } catch (err) {
      setGenerateGridError('Something went wrong')
    }
  }

  useEffect(() => {
    if (assignmentValue === 'randomly_assigned') unregister('selected_squares')
  }, [assignmentValue, unregister, numberOfSetsValue])

  if (!settingsData) {
    return null
  }

  return (
    <div className={styles.settings}>
      {!passedDeadline && (
        <>
          <div
            className={classNames(
              styles.firstRowSettingWrapper,
              styles.withSelect,
            )}
          >
            {numberOfSquaresFieldOptions.length && (
              <div className={styles.numberOfSquaresWrapper}>
                {numberOfSquaresFieldOptions.map((item) => {
                  return (
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
                  )
                })}
              </div>
            )}

            {numberOfSetsFieldOptions.length && numberOfSetsField && (
              <div className={styles.gridSizeSelectWrapper}>
                <RHFSelect
                  control={control}
                  name="number_of_sets"
                  options={numberOfSetsFieldOptions}
                  withLabel
                  placeholder="Grid Size"
                  defaultValue={
                    !!('value' in numberOfSetsField.field) &&
                    numberOfSetsField.field.value
                  }
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
                    placeholder="Grid Name"
                    withLabel
                    required
                    defaultValue={
                      'value' in gridNameField.field
                        ? gridNameField.field.value
                        : ''
                    }
                  />
                )}
              </div>

              <div>
                {!!squaresPerMemberFieldOptions.length &&
                  squaresPerMemberField && (
                    <RHFSelect
                      control={control}
                      name="max_squares_per_member"
                      options={squaresPerMemberFieldOptions}
                      withLabel
                      placeholder="Squares per member"
                      defaultValue={
                        !!('value' in squaresPerMemberField.field) &&
                        squaresPerMemberField.field.value
                      }
                    />
                  )}
              </div>
            </div>
          )}

          {!!weekOfGameFieldOptions.length && (
            <div className={classNames(styles.weekOfGameWrapper, styles.full)}>
              <HorizontalFilterByWeek4
                weeks={weekOfGameFieldOptions}
                setValue={setValue}
                name="week_of_game"
                slidesInSlider={11}
              />
            </div>
          )}

          {!!(gameForGridOptions.length || assignmentFieldOptions.length) && (
            <div className={styles.gameForWeekAndNumbersWrapper}>
              <div>
                {!!gameForGridOptions.length && (
                  <RHFSelect
                    control={control}
                    placeholder="Game for Grid"
                    name="event_id"
                    withLabel
                    options={gameForGridOptions}
                  />
                )}
              </div>
              <div>
                {!!assignmentFieldOptions.length && assignmentField && (
                  <RHFSelect
                    control={control}
                    placeholder="Numbers on the grid are"
                    name="assignment"
                    options={assignmentFieldOptions}
                    withLabel
                    defaultValue={
                      !!('value' in assignmentField.field) &&
                      assignmentField.field.value
                    }
                  />
                )}
              </div>
            </div>
          )}

          {assignmentValue === 'custom_assigned' && (
            <div className={styles.axisesWrapper}>
              <div className={styles.axisWrapper}>
                <div
                  className={styles.axisTitle}
                  onClick={() => setshowXAxis((prev) => !prev)}
                >
                  {!!teams && teams[0]}
                  <BottomArrow
                    className={classNames(styles.arrow, {
                      [styles.disabled]: !showXAxis,
                    })}
                  />
                </div>
                {!!axisCustomFields &&
                  showXAxis &&
                  axisCustomFields.map((item, index) => {
                    if (index < numberOfSetsValue)
                      return (
                        <div
                          key={index}
                          className={classNames(styles.axisSet, {
                            [styles.single]: numberOfSetsValue === '1',
                          })}
                        >
                          {numberOfSetsValue !== '1' && (
                            <div className={styles.lines}>
                              <div className={styles.line} />
                              <div className={styles.line} />
                              <div className={styles.line} />
                              <div className={styles.line} />
                            </div>
                          )}
                          <span>
                            X - Axis {numberOfSetsValue !== '1' && index + 1}
                          </span>
                          <Selectors
                            name={item.name}
                            setValue={setValue}
                            customField={item.field}
                            numberOfSetsValue={numberOfSetsValue}
                          />
                        </div>
                      )
                  })}
              </div>
              <div className={styles.axisWrapper}>
                <div
                  className={styles.axisTitle}
                  onClick={() => setShowYAxis((prev) => !prev)}
                >
                  {!!teams && teams[1]}
                  <BottomArrow
                    className={classNames(styles.arrow, {
                      [styles.disabled]: !showYAxis,
                    })}
                  />
                </div>
                {!!axisCustomFields &&
                  showYAxis &&
                  axisCustomFields.map((item, index) => {
                    if (
                      index >= axisCustomFields.length / 2 &&
                      index <
                        axisCustomFields.length / 2 + Number(numberOfSetsValue)
                    )
                      return (
                        <div
                          key={index}
                          className={classNames(styles.axisSet, {
                            [styles.single]: numberOfSetsValue === '1',
                          })}
                        >
                          {numberOfSetsValue !== '1' && (
                            <div className={styles.lines}>
                              <div className={styles.line} />
                              <div className={styles.line} />
                              <div className={styles.line} />
                              <div className={styles.line} />
                            </div>
                          )}
                          Y - Axis {numberOfSetsValue !== '1' && index + 1 - 4}
                          <Selectors
                            name={item.name}
                            setValue={setValue}
                            customField={item.field}
                            numberOfSetsValue={numberOfSetsValue}
                          />
                        </div>
                      )
                  })}
              </div>
            </div>
          )}

          {!!isNumberPickableSquare && (
            <div>
              <RHFSwitcher
                control={control}
                name="is_number_pickable_square"
                defaultValue={
                  !!('value' in isNumberPickableSquare.field) &&
                  isNumberPickableSquare.field.value
                }
              >
                <div className={styles.checkboxData}>
                  {isNumberPickableSquare.title}
                  <InfoContainer>
                    {isNumberPickableSquare.tooltip?.content}
                  </InfoContainer>
                </div>
              </RHFSwitcher>
            </div>
          )}

          {!!isShowAxisNumbers && (
            <div>
              <RHFSwitcher
                control={control}
                name="is_show_axis_numbers"
                defaultValue={
                  !!('value' in isShowAxisNumbers.field) &&
                  isShowAxisNumbers.field.value
                }
              >
                <div className={styles.checkboxData}>
                  {isShowAxisNumbers.title}
                  <InfoContainer>
                    {isShowAxisNumbers.tooltip?.content}
                  </InfoContainer>
                </div>
              </RHFSwitcher>
            </div>
          )}

          {!!gridTypeField && (
            <div className={styles.masterWrapper}>
              {String(gridTypeFieldValue).includes('Master') ? (
                <div>{gridTypeFieldValue}</div>
              ) : (
                <>
                  <Switcher
                    value={gridTypeStatus}
                    onChange={setGridTypeStatus}
                    onChangeEvent={() =>
                      gridTypeStatus
                        ? (unregister('master_grid_id'),
                          setValue('grid_status', 'standalone'))
                        : setValue('grid_status', 'secondary')
                    }
                  >
                    <div className={styles.checkboxData}>
                      Link to a Master Grid
                      <InfoContainer>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: gridTypeField.tooltip?.content[0] ?? '',
                          }}
                        ></div>
                      </InfoContainer>
                    </div>
                  </Switcher>
                  {gridTypeFieldValue === 'Standalone' && gridTypeStatus ? (
                    <>
                      {gridTypeDependentFieldOptions && (
                        <RHFSelect
                          control={control}
                          name="master_grid_id"
                          options={gridTypeDependentFieldOptions}
                          defaultValue={gridTypeDependentFieldOptions[0].name}
                        />
                      )}
                    </>
                  ) : gridTypeStatus ? (
                    <>{gridTypeFieldValue}</>
                  ) : (
                    gridTypeFieldValue !== 'Standalone' && (
                      <>Convert Grid to Standalone</>
                    )
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      {passedDeadline && (
        <>
          <p>
            The game assigned to this grid has already started and most settings
            can no longer be changed.
          </p>

          {!!gridNameField && (
            <RHFInput
              control={control}
              name="name"
              placeholder="Grid Name"
              withLabel
              required
              defaultValue={
                'value' in gridNameField.field ? gridNameField.field.value : ''
              }
            />
          )}
        </>
      )}

      {generateGridError && (
        <div
          className={classNames('alert alert-danger')}
          style={{ marginTop: '15px' }}
        >
          {generateGridError}
        </div>
      )}

      <div className={styles.buttons}>
        <div className={styles.deleteWrapper}>
          {showDelete ? (
            <div className={styles.deleteConfirm}>
              <span>Delete the grid?</span>
              <span
                className={styles.deleteButton}
                onClick={() => setShowDelete(false)}
              >
                No
              </span>
              <span
                className={classNames(styles.deleteButton, styles.confirm)}
                onClick={deleteGrid}
              >
                Yes
              </span>
            </div>
          ) : (
            <button
              className={classNames('button', styles.showDeleteButton)}
              onClick={() => setShowDelete(true)}
            >
              delete grid
            </button>
          )}
        </div>
        <button
          className={classNames(
            'button button-blue-light',
            styles.generateGridBtn,
            styles.wide,
            { disabled: isLoading },
          )}
          onClick={handleSubmit(sendData)}
        >
          SAVE CHANGES
        </button>
      </div>
    </div>
  )
}
