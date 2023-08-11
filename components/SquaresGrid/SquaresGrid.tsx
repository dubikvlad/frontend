import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'
import { KeyedMutator } from 'swr'

import {
  api,
  EntriesPoolEntriesData,
  GolfGridInfo,
  GridData,
  GridDataEntryItem,
  GridInfo,
  GridInfoForecastItem,
  GridInfoRandomSquaresNumberOfSets1,
  GridInfoRandomSquaresNumberOfSets4,
  GridResponseData,
  Participant,
  ResponseData,
  ScopesCodes,
  SquaresEntriesItem,
  UserForManagementItem,
  UsersForManagementResponseData,
  WinningSquare,
} from '@/api'
import { Cross, MonthLeftArrow, MonthRightArrow } from '@/assets/icons'
import {
  defaultEntryColor,
  generateParticipantImagePath,
  getShortName,
  rf,
  writeErrorToState,
} from '@/config/constants'
import { ColorPicker, Input, Modal, RHFInput, Select } from '@/features/ui'
import { ModalProps } from '@/features/ui/Modal'
import { Option } from '@/features/ui/Select/Select'
import {
  useGetPoolEntries,
  useGetUserInfo,
  useGrid,
  useMessage,
  usePool,
  useUsersForManagement,
} from '@/helpers'

import styles from './SquaresGrid.module.scss'

type GridProps = {
  wrapperRef: RefObject<HTMLElement>
  // preview mode
  isPreview?: boolean
  // отключить грид для взаимодействия
  isDisabled?: boolean
  // видоизменяет грид под вывод на pdf
  isPDF?: boolean
  // функция возвращает координаты ячейки (счет начинается с 0)
  getCellCoordinates?: (x: number, y: number, entryId?: number) => void
  // функция возвращает ошибку
  getError?: (error: string) => void
  // подсвечивать ли выигрышную ставку
  isHighlightResult?: boolean
  // выбранная четверть
  selectedQuarter?: ScopesCodes
  // лимит бесплатных ставок закончился
  isFreeLimitOver?: boolean
  // ? атрибуты с префиксом custom нужны
  // ? для grid с пропсом isPreview
  // ? ну или просто в зависимости от ситуации
  // текущий энтрис
  customCurrentEntry?: SquaresEntriesItem
  // кол-во выводов полей с рандомным значением
  // (на данный момент 1 или 4)
  customNumberOfSets?: number
  // кол-во квадратов на сетку
  customSquaresOnGrid?: number // 100 | 50 | 25
  // показывать ли номера ячеек
  customIsShowCellNumbers?: boolean
  xCustomTeam?: Participant
  yCustomTeam?: Participant
  customAxisSquares?:
    | GridInfoRandomSquaresNumberOfSets1
    | GridInfoRandomSquaresNumberOfSets4
  customGridId?: number | null
  isGolf?: boolean
}

type GridTeam = {
  name: string
  image: string
}

const isGolfGrid = (grid: GridInfo | GolfGridInfo): grid is GolfGridInfo =>
  typeof grid.x_axis_participant === 'string'

export function SquaresGrid({
  wrapperRef,
  isPreview = false,
  isDisabled = false,
  isPDF = false,
  getCellCoordinates,
  getError,
  isHighlightResult = false,
  selectedQuarter,
  isFreeLimitOver = false,
  customCurrentEntry,
  customNumberOfSets,
  customSquaresOnGrid,
  customIsShowCellNumbers,
  xCustomTeam,
  yCustomTeam,
  customAxisSquares,
  customGridId,
  isGolf = false,
}: GridProps) {
  const {
    query: { poolId, grid_id },
  } = useRouter()

  const gridId = customGridId ?? (grid_id ? Number(grid_id) : undefined)

  const { userInfoData } = useGetUserInfo()
  const { poolData } = usePool<'squares'>(Number(poolId))

  const { poolEntriesData, poolEntriesMutate } = useGetPoolEntries<'squares'>({
    poolId: poolData?.id,
  })

  const currentEntry =
    customCurrentEntry ??
    (poolEntriesData.length && userInfoData
      ? poolEntriesData.find(
          (entry) => entry.user_id === userInfoData.id && !entry.is_guest,
        )
      : undefined)

  const { gridData, gridDataEntries, gridMutate } = useGrid({
    poolId: Number(poolId),
    gridId: gridId,
  })

  const isCommissioner =
    poolData && userInfoData ? poolData.owner.id === userInfoData.id : false

  const { usersForManagementData, usersForManagementMutate } =
    useUsersForManagement(isCommissioner ? Number(poolId) : undefined)

  const assignMemberOptions: Option[] = useMemo(() => {
    return usersForManagementData.map((item) => {
      // если пользователь является коммиссионером, то
      // опция не будет отключена
      const isDisabled =
        gridData?.max_squares_per_member === 0
          ? false
          : gridData
          ? gridData.forecasts.filter(
              (forecast) => forecast.entry_id === item.entries[0].id,
            ).length >= gridData.max_squares_per_member
          : true

      return {
        title: item.username,
        name: String(item.id),
        isDisabled: isDisabled,
      }
    })
  }, [usersForManagementData, gridData])

  const [wrapperWidth, setWrapperWidth] = useState<number | null>(null)

  const calculateContainerWidth = useCallback(
    (wrapperRef: RefObject<HTMLElement>) => {
      if (wrapperRef.current) {
        const wrapperStyles: Partial<CSSStyleDeclaration> =
          typeof window !== undefined && wrapperRef.current
            ? window.getComputedStyle(wrapperRef.current)
            : {}

        const wrapperWidth = wrapperRef.current
          ? wrapperRef.current.offsetWidth -
            (wrapperStyles.paddingLeft
              ? parseInt(wrapperStyles.paddingLeft)
              : 0) -
            (wrapperStyles.paddingRight
              ? parseInt(wrapperStyles.paddingRight)
              : 0)
          : 0

        setWrapperWidth(wrapperWidth)
      }
    },
    [],
  )

  // высчитывает ширину контейнера, в котором находится грид,
  // если она еще не рассчитана
  useEffect(() => {
    if (wrapperWidth === null) calculateContainerWidth(wrapperRef)
  }, [wrapperRef, wrapperWidth, calculateContainerWidth])

  // навешивает событие изменения ширины окна, которое
  // высчитывает ширину контейнера, в котором находится грид
  useEffect(() => {
    function resize() {
      calculateContainerWidth(wrapperRef)
    }

    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [wrapperRef, calculateContainerWidth])

  const [yAxisCellsWrapperCoords, setYAxisCellsWrapperCoords] =
    useState<null | DOMRect>(null)

  // реф нужен для курсора
  const [yAxisCellsWrapperElement, setYAxisCellsWrapperElement] =
    useState<HTMLDivElement | null>(null)

  const yAxisCellsWrapperRefCallback = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      const coords = node.getBoundingClientRect()
      setYAxisCellsWrapperCoords(coords)
      setYAxisCellsWrapperElement(node)
    }
  }, [])

  const squaresOnGrid = customSquaresOnGrid ?? gridData?.number_of_squares
  const numberOfSets = customNumberOfSets ?? gridData?.number_of_sets

  const [xTeam, yTeam] = useMemo(() => {
    let xTeam: GridTeam = {
      image: '',
      name: '',
    }
    let yTeam: GridTeam = {
      image: '',
      name: '',
    }

    if (gridData) {
      if (isGolfGrid(gridData)) {
        xTeam.name = gridData.x_axis_participant
        yTeam.name = gridData.y_axis_participant
      } else {
        if (gridData?.x_axis_participant) {
          xTeam = {
            name: gridData?.x_axis_participant.name,
            image: generateParticipantImagePath(
              gridData?.x_axis_participant.external_id,
            ),
          }
        }

        if (gridData?.y_axis_participant) {
          yTeam = {
            name: gridData?.y_axis_participant.name,
            image: generateParticipantImagePath(
              gridData?.y_axis_participant.external_id,
            ),
          }
        }
      }
    }

    if (isPreview) {
      if (xCustomTeam) {
        xTeam = {
          name: xCustomTeam.name,
          image: generateParticipantImagePath(xCustomTeam.external_id),
        }
      }

      if (yCustomTeam) {
        yTeam = {
          name: yCustomTeam.name,
          image: generateParticipantImagePath(yCustomTeam.external_id),
        }
      }
    }

    return [xTeam, yTeam]
  }, [xCustomTeam, yCustomTeam, gridData, isPreview])

  // на бэке если random_squares или selected_squares
  // пустые, то тогда возвращается не null,
  // а пустой массив, а так это объект
  const axisSquares =
    customAxisSquares ??
    (gridData?.is_random
      ? gridData?.random_squares
      : gridData?.selected_squares)

  const isShowCellNumbers =
    customIsShowCellNumbers ?? !!gridData?.is_number_pickable_square

  const [selectedCoords, setSelectedCoords] = useState<null | {
    x: number
    y: number
  }>(null)

  const [selectedForecast, setSelectedForecast] =
    useState<null | GridInfoForecastItem>(null)

  const [isAssignMemberOrQuestModalOpen, setAssignMemberOrQuestModalOpen] =
    useState(false)
  const [isEditMemberOrQuestModalOpen, setEditMemberOrQuestModalOpen] =
    useState(false)

  const [forecastIsLoading, setForecastIsLoading] = useState(false)

  useEffect(() => {
    function cursorMousemove(
      event: MouseEvent,
      wrapperElement: HTMLDivElement,
    ) {
      const tooltip: HTMLElement | null = document.querySelector(
        `.${styles.cellsTooltip}`,
      )

      if (tooltip) {
        const wrapperCoords = wrapperElement.getBoundingClientRect()

        // зеленые ячейки
        const yAxisCellRowElement = document.querySelector(
          `.${styles.yAxisCellRow}`,
        )

        const yAxisCellRowElements = yAxisCellRowElement
          ? yAxisCellRowElement.querySelectorAll(
              `.${styles.yAxisCellWithValue}`,
            )
          : undefined

        // если есть wrapper для ячеек, значит, это number_of_squares = 25
        // и тогда для правильных вычислений ширины ячеек полученную длину нужно разделить на 2
        const cellsWidth = yAxisCellRowElements
          ? (yAxisCellRowElements.length /
              (yAxisCellRowElement?.querySelector(
                `.${styles.yAxisCellWithValueWrapper}`,
              )
                ? 2
                : 1)) *
            yAxisCellRowElements[0].clientWidth
          : 0

        // tooltip width and height
        const initialTooltipWidth = tooltip.clientWidth
        const initialTooltipHeight = tooltip.clientHeight

        // tooltip top
        function calcTooltipTop(tooltipTop = 0, tooltipHeight = 0) {
          if (event.clientY + tooltipHeight >= wrapperCoords.bottom) {
            return wrapperCoords.bottom - wrapperCoords.top - tooltipHeight
          } else {
            return tooltipTop
          }
        }

        const initialTooltipTop = event.clientY - wrapperCoords.y

        const tooltipTop = calcTooltipTop(
          initialTooltipTop,
          initialTooltipHeight,
        )

        // tooltip left
        function calcTooltipLeft(
          tooltipLeft = 0,
          leftIndent = 0,
          tooltipWidth = 0,
        ) {
          if (
            event.clientX + tooltipWidth + leftIndent >=
            wrapperCoords.right
          ) {
            return wrapperCoords.right - wrapperCoords.left - tooltipWidth
          } else if (event.clientX <= wrapperCoords.left + cellsWidth) {
            return cellsWidth
          } else {
            return tooltipLeft
          }
        }

        const leftIndent = 23 // отступ от курсора
        const initialTooltipLeft = event.clientX - wrapperCoords.x + leftIndent

        const tooltipLeft = calcTooltipLeft(
          initialTooltipLeft,
          leftIndent,
          initialTooltipWidth,
        )

        tooltip.style.top = `${tooltipTop}px`
        tooltip.style.left = `${tooltipLeft}px`

        // opacity
        tooltip.style.opacity = '1'

        const cellElements = document.querySelectorAll(
          `.${styles.cell}:not(.${styles.cellForecastLimit})`,
        )

        // если курсор находится в позиции активных форкастов,
        // то tooltip будет скрыт
        cellElements.forEach((cell) => {
          const cellCoords = cell.getBoundingClientRect()

          if (
            event.clientX >= cellCoords.left &&
            event.clientX < cellCoords.right &&
            event.clientY >= cellCoords.top &&
            event.clientY <= cellCoords.bottom
          ) {
            tooltip.style.opacity = '0'
          }
        })

        // скрывает tooltip на зеленых ячейках
        if (event.clientX < wrapperCoords.left + cellsWidth) {
          tooltip.style.opacity = '0'
        }
      }
    }

    function mousemove(event: MouseEvent) {
      if (yAxisCellsWrapperElement)
        cursorMousemove(event, yAxisCellsWrapperElement)
    }

    function mouseleave() {
      const tooltip: HTMLElement | null = document.querySelector(
        `.${styles.cellsTooltip}`,
      )

      if (tooltip) {
        tooltip.style.opacity = '0'
      }
    }

    if (yAxisCellsWrapperElement) {
      yAxisCellsWrapperElement.addEventListener('mousemove', mousemove)
      yAxisCellsWrapperElement.addEventListener('mouseleave', mouseleave)
    }

    return () => {
      if (yAxisCellsWrapperElement) {
        yAxisCellsWrapperElement.removeEventListener('mousemove', mousemove)
        yAxisCellsWrapperElement.removeEventListener('mouseleave', mouseleave)
      }
    }
  }, [yAxisCellsWrapperElement])

  // подсвечиваемая запись
  const [highlightQuarter, setHighlightQuarter] =
    useState<null | WinningSquare>(null)

  if (!wrapperWidth || !numberOfSets) return null
  if (
    !squaresOnGrid ||
    !(squaresOnGrid === 100 || squaresOnGrid === 50 || squaresOnGrid === 25)
  ) {
    return null
  }
  if (axisSquares && Array.isArray(axisSquares)) return null
  if (axisSquares && numberOfSets === 1 && !('fe' in axisSquares)) {
    return null
  }
  if (
    axisSquares &&
    numberOfSets === 4 &&
    (!('1q' in axisSquares) ||
      !('2q' in axisSquares) ||
      !('3q' in axisSquares) ||
      !('4q' in axisSquares))
  ) {
    return null
  }

  // размер сетки по дизайну, исходя из этого размера
  // будет высчитываться процентное соотношение
  // (размер шрифта и т.д.)
  const initialWrapperSize = 1111 // px

  // team name
  const initialTeamNameFontSize = 24 // px
  const initialTeamNameLineHeight = 29 // px

  // random cell value
  const initialRandomCellValueFontSize = 18 // px
  const initialRandomCellValueLineHeight = 22 // px

  // quartet name
  const initialQuartetNameFontSize = 14 // px
  const initialQuartetNameLineHeight = 15 // px

  // cell hover text
  const initialCellHoverTextFontSize = 14 // px
  const initialCellHoverTextLineHeight = 17 // px

  const calcResponseValue = (value: number): number =>
    (value * wrapperWidth) / initialWrapperSize

  const wrapperSize = 100 // %
  const teamNameSize = 6.3 // %

  // размер поля с рандомным значением (ячейка со знаком вопроса)
  const cellSizeWithValue =
    numberOfSets === 1 ? 3.6 : numberOfSets > 1 ? 2.7 : 0 // %
  const cellSizeWithValuePx = (cellSizeWithValue * wrapperWidth) / 100 // px

  // размер поля с ячейками без учета размера выделенного
  // для названия команды и итогового результата команды
  const cellWrapperSize = +(
    wrapperSize -
    teamNameSize -
    cellSizeWithValue * numberOfSets
  ).toFixed(2) // %

  // кол-во ячеек
  const numberOfCells = 10
  const numberOfCellsSquaresOnGrid =
    squaresOnGrid === 50 || squaresOnGrid === 100
      ? squaresOnGrid / numberOfCells
      : 5

  // размер одной ячейки
  const cellSize = +(cellWrapperSize / numberOfCells).toFixed(2) // %

  // размер ячейки в пикселях
  const cellSizePx = (cellSize * wrapperWidth) / 100 // px

  function handlingXAxis(index: number) {
    const defaultResult: string[] = Array(numberOfCells).fill('?')

    if (!axisSquares || index === undefined) return defaultResult

    if (numberOfSets === 1 && 'fe' in axisSquares) {
      return axisSquares.fe.x
    }

    if (numberOfSets === 4 && `${index + 1}q` in axisSquares) {
      const axisSquares4 = axisSquares as GridInfoRandomSquaresNumberOfSets4

      const receivedIndex = numberOfSets - index
      if (
        receivedIndex === 1 ||
        receivedIndex === 2 ||
        receivedIndex === 3 ||
        receivedIndex === 4
      ) {
        return axisSquares4[`${receivedIndex}q`].x
      }
    }

    return defaultResult
  }

  function handlingYAxis(yIndex: number) {
    const defaultResult: string[] = Array(numberOfSets).fill(
      squaresOnGrid === 25 ? ['?', '?'] : '?',
    )

    if (!axisSquares || yIndex === undefined) return defaultResult

    if (numberOfSets === 1 && 'fe' in axisSquares) {
      if (squaresOnGrid === 25) {
        // возвращает массив в массиве
        return [
          [
            axisSquares.fe.y[yIndex + yIndex],
            axisSquares.fe.y[yIndex + yIndex + 1],
          ],
        ]
      }

      return [axisSquares.fe.y[yIndex]]
    }

    if (numberOfSets === 4) {
      const axisSquares4 = axisSquares as GridInfoRandomSquaresNumberOfSets4

      return Array(numberOfSets)
        .fill(0)
        .map((_, i) => {
          if (`${i + 1}q` in axisSquares4) {
            const receivedIndex = numberOfSets - i

            if (
              receivedIndex === 1 ||
              receivedIndex === 2 ||
              receivedIndex === 3 ||
              receivedIndex === 4
            ) {
              if (squaresOnGrid === 25) {
                return [
                  axisSquares4[`${receivedIndex}q`].y[yIndex + yIndex],
                  axisSquares4[`${receivedIndex}q`].y[yIndex + yIndex + 1],
                ]
              }

              return axisSquares4[`${receivedIndex}q`].y[yIndex]
            }
          }
          return '?'
        })
    }

    return defaultResult
  }

  const forecasts = gridData?.forecasts ?? []

  async function makeAForecast(x: number, y: number, userId?: number) {
    if (!poolData || !currentEntry || !gridData) return

    try {
      setForecastIsLoading(true)

      const res = await api.forecasts.setForecasts(
        poolData.id,
        userId ?? currentEntry.id,
        {
          forecasts: {
            squares_grid_id: gridData.id,
            x_axis: x,
            y_axis: y,
          },
        },
      )

      if (res.error) {
        if ('message' in res.error) {
          if (getError) getError(res.error.message)
        }

        if ('messages' in res.error) {
          if (getError) getError(res.error.getFirstMessage())
        }

        setForecastIsLoading(false)
        return
      }

      await Promise.all([poolEntriesMutate(), gridMutate()])
      setForecastIsLoading(false)
    } catch (err) {
      setForecastIsLoading(false)
    }
  }

  const isForecastLimit =
    userInfoData && poolData && gridData && currentEntry
      ? userInfoData.id === poolData.owner.id ||
        gridData.max_squares_per_member === 0
        ? false
        : gridData.forecasts.filter(
            (forecast) => forecast.entry_id === currentEntry.id,
          ).length >= gridData.max_squares_per_member
      : true

  const isDeadline = !isCommissioner && false
  const isCellBlocked = !isCommissioner && !!gridData?.is_show_axis_numbers

  const winningSquares = (gridData?.winning_squares ?? []).filter((square) =>
    !selectedQuarter || selectedQuarter === 'fe'
      ? true
      : square.round === selectedQuarter,
  )

  const imagesSize = calcResponseValue(55)
  const participantImageSize =
    imagesSize < 27 ? 27 : imagesSize > 55 ? 55 : imagesSize

  const teamNameFontSize = calcResponseValue(initialTeamNameFontSize)
  const finalTeamNameFontSize = teamNameFontSize < 12 ? 12 : teamNameFontSize

  return (
    <div
      className={classNames(styles.gridWrapper, {
        [styles.previewMode]: isPreview,
        [styles.gridDisabled]: isDisabled || forecastIsLoading,
      })}
      style={{
        gridTemplateRows: `${teamNameSize}% ${
          cellSizeWithValue * numberOfSets
        }% 1fr`,
        height: `${wrapperWidth}px`,
      }}
    >
      <div
        className={styles.xAxisTeam}
        style={{
          marginLeft: `${teamNameSize + cellSizeWithValue * numberOfSets}%`,
        }}
      >
        <p
          className={classNames(styles.xAxisTeamName, {
            [styles.xAxisTeamNameNotTeam]: !xTeam.name,
          })}
          style={{
            fontSize: `${finalTeamNameFontSize}px`,
            lineHeight: `${calcResponseValue(initialTeamNameLineHeight)}px`,
          }}
        >
          <span className={styles.notTeamQuestionMark}>?</span>
          {xTeam.image && (
            <Image
              src={xTeam.image}
              width={participantImageSize}
              height={participantImageSize}
              alt={xTeam.name ?? 'Team 1'}
              unoptimized={isPDF}
            />
          )}
          {xTeam.name ? xTeam.name : isGolf ? <></> : <span>Team 1</span>}
        </p>
      </div>

      <div
        className={styles.numberOfSetsContainer}
        style={{
          marginLeft: `${teamNameSize}%`,
        }}
      >
        {Array(numberOfSets)
          .fill(0)
          .map((_, i, numberArr: number[]) => (
            <div
              className={classNames(styles.numberOfSetsWrapper)}
              key={i}
              style={{
                gridTemplateColumns: `repeat(${numberOfSets}, ${cellSizeWithValuePx}px) 1fr`,
              }}
            >
              {numberArr.length > 1 ? (
                numberArr.map((_, j, numberArrQuartet) => (
                  <div
                    key={j}
                    className={classNames(styles.quartet, {
                      [styles.firstQuartet]: i + 1 >= 1,
                      [styles.secondQuartet]: i + 1 >= 2 && j + 1 >= 2,
                      [styles.thirdQuartet]: i + 1 >= 3 && j + 1 >= 3,
                      [styles.fourthQuartet]: i + 1 >= 4 && j + 1 >= 4,
                      [styles.xAxisQuartet]: j + 1 >= i + 1 && i !== 0,
                      [styles.yAxisQuartet]: i + 1 >= j + 1 && j !== 0,
                      [styles.xAxisQuartetLastChild]:
                        j === numberArrQuartet.length - 1,
                      [styles.yAxisQuartetLastChild]:
                        i === numberArrQuartet.length - 1,
                      [styles.quartetBorderRadius]: i === j,
                    })}
                  >
                    <p
                      style={{
                        fontSize: `${calcResponseValue(
                          initialQuartetNameFontSize,
                        )}px`,
                        lineHeight: `${calcResponseValue(
                          initialQuartetNameLineHeight,
                        )}px`,
                      }}
                    >
                      {i === j ? `Q${numberArr.length - j}` : ''}
                    </p>
                  </div>
                ))
              ) : (
                <div></div>
              )}

              <div>
                <div
                  key={i}
                  className={classNames(styles.xAxisCells, {
                    [styles.xAxisCellsFirst]:
                      i + 1 === 1 && numberArr.length > 1,
                    [styles.xAxisCellsSecond]: i + 1 === 2,
                    [styles.xAxisCellsThird]: i + 1 === 3,
                    [styles.xAxisCellsFourth]: i + 1 === 4,
                  })}
                  style={{
                    gridTemplateColumns: `repeat(${numberOfCells}, ${cellSizePx}px)`,
                    height: `${cellSizeWithValuePx}px`,
                  }}
                >
                  {handlingXAxis(i).map((item, xCoords, arr) => {
                    // проверка на ячейку с выигрывшим числом
                    const isWinCell = !!winningSquares.find((square) => {
                      const squareScoreX = String(square.score_x)

                      const basicCondition =
                        String(item) === squareScoreX[squareScoreX.length - 1]

                      return numberOfSets === 1
                        ? basicCondition
                        : basicCondition &&
                            parseInt(square.round) === numberArr.length - i
                    })

                    return (
                      <p
                        key={xCoords}
                        className={classNames({
                          [styles.xAxisQuartet]: numberArr.length > 1,
                          [styles.xAxisFirstChild]: xCoords === 0,
                          [styles.xAxisLastChild]: xCoords === arr.length - 1,
                          [styles.xAxisWinCell]: isWinCell && isHighlightResult,
                        })}
                        style={{
                          fontSize: `${calcResponseValue(
                            initialRandomCellValueFontSize,
                          )}px`,
                          lineHeight: `${calcResponseValue(
                            initialRandomCellValueLineHeight,
                          )}px`,
                        }}
                      >
                        {item}
                      </p>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
      </div>

      <div
        className={styles.yAxisWrapper}
        style={{
          gridTemplateColumns: `${teamNameSize}% ${
            cellSizeWithValue * numberOfSets + cellWrapperSize
          }%`,
          height: `${cellWrapperSize}%`,
        }}
      >
        <div className={styles.yAxisTeam}>
          <p
            className={classNames(styles.yAxisTeamName, {
              [styles.yAxisTeamNameNotTeam]: !yTeam.name,
            })}
            style={{
              fontSize: `${finalTeamNameFontSize}px`,
              lineHeight: `${calcResponseValue(initialTeamNameLineHeight)}px`,
            }}
          >
            <span className={styles.yNotTeamQuestionMark}>?</span>
            {yTeam.image && (
              <Image
                src={yTeam.image}
                width={participantImageSize}
                height={participantImageSize}
                alt={yTeam.name ?? 'Team 2'}
                unoptimized={isPDF}
              />
            )}
            {yTeam.name ? yTeam.name : isGolf ? <></> : <span>Team 2</span>}
          </p>
        </div>

        <div
          ref={yAxisCellsWrapperRefCallback}
          className={styles.yAxisCellsWrapper}
        >
          {Array(squaresOnGrid === 25 ? numberOfCells / 2 : numberOfCells)
            .fill(0)
            .map((_, yCoords, arr) => (
              <div
                key={yCoords}
                className={classNames(styles.yAxisCellRow, {
                  [styles.yAxisCellRowLastChild]: arr.length - 1 === yCoords,
                })}
                style={{
                  gridTemplateColumns: `repeat(${numberOfSets}, ${cellSizeWithValuePx}px) 1fr`,
                  height: `${cellSizePx * (squaresOnGrid === 25 ? 2 : 1)}px`,
                }}
              >
                {handlingYAxis(yCoords).map((item, j, numberOfSetsArr) => {
                  const Component = ({ text }: { text: string | number }) => {
                    // проверка на то, является ли данная ячейка
                    // выигрывшей
                    const winCell = winningSquares.find((square) => {
                      const squareScoreY = String(square.score_y)

                      const basicCondition =
                        String(text) === squareScoreY[squareScoreY.length - 1]

                      return numberOfSets === 1
                        ? basicCondition
                        : basicCondition &&
                            parseInt(square.round) ===
                              numberOfSetsArr.length - j
                    })

                    const isQuarter = numberOfSetsArr.length > 1

                    return (
                      <p
                        className={classNames(styles.yAxisCellWithValue, {
                          [styles.yAxisCellWithValueFirstChild]: yCoords === 0,
                          [styles.yAxisCellWithValueLastChild]:
                            yCoords === arr.length - 1,
                          [styles.yAxisCellWithValueQuartet]: isQuarter,
                          [styles.yAxisCellWithValueQuartetLastRow]:
                            isQuarter && yCoords === arr.length - 1,
                          [styles.yAxisCellWithValueQuartet25]:
                            isQuarter && squaresOnGrid === 25,
                          [styles.yAxisCellWithValueWinCell]:
                            winCell && isHighlightResult,
                        })}
                        style={{
                          fontSize: `${calcResponseValue(
                            initialRandomCellValueFontSize,
                          )}px`,
                          lineHeight: `${calcResponseValue(
                            initialRandomCellValueLineHeight,
                          )}px`,
                        }}
                      >
                        {text}
                      </p>
                    )
                  }

                  return squaresOnGrid === 25 ? (
                    <div key={j} className={styles.yAxisCellWithValueWrapper}>
                      {Array.isArray(item) && (
                        <>
                          <Component text={item[0]} />
                          <Component text={item[1]} />
                        </>
                      )}
                    </div>
                  ) : (
                    !Array.isArray(item) && <Component key={j} text={item} />
                  )
                })}

                <div
                  className={styles.yAxisCellsFieldCells}
                  style={{
                    gridTemplateColumns: `repeat(${numberOfCellsSquaresOnGrid}, 1fr)`,
                  }}
                >
                  {Array(numberOfCellsSquaresOnGrid)
                    .fill(0)
                    .map((_, xCoords, arr1) => {
                      // проверка на наличие форкаста, для заданной
                      // оси координат
                      const forecast = forecasts.find(
                        (forecast) =>
                          forecast.x_axis === xCoords &&
                          forecast.y_axis === yCoords,
                      )

                      // получение данных записи по нужному форкасту
                      const forecastEntry = forecast
                        ? gridDataEntries.find(
                            (entry) => entry.id === forecast.entry_id,
                          )
                        : undefined

                      // проверка на гостевые форкасты
                      // фильтрация по гостевым форкастам
                      const userEntries = forecastEntry
                        ? poolEntriesData.filter(
                            (entry) =>
                              entry.user_id === forecastEntry.user_id &&
                              !!entry.is_guest,
                          ) ?? []
                        : []

                      // является ли текущий энтрис гостевым
                      const isEntryGuest = forecastEntry
                        ? !!userEntries.find(
                            (item) => item.id === forecastEntry.id,
                          )
                        : false

                      const forecastPoolEntry =
                        forecastEntry &&
                        poolEntriesData.find(
                          (entry) => entry.id === forecastEntry.id,
                        )

                      // есть ли выигрывшая ставка
                      const cellWin = winningSquares.find(
                        (square) =>
                          square.x_axis === xCoords &&
                          square.y_axis === yCoords,
                      )

                      // если ячейка на выигрышной оси
                      const isCellOnWinningAxis =
                        numberOfSets > 1
                          ? highlightQuarter?.x_axis === xCoords ||
                            highlightQuarter?.y_axis === yCoords
                          : winningSquares.find(
                              (square) =>
                                square.x_axis === xCoords ||
                                square.y_axis === yCoords,
                            )

                      return (
                        <div
                          key={xCoords}
                          className={classNames(styles.cell, {
                            [styles.cellPreview]: isPreview,
                            [styles.xCellLastChild]:
                              xCoords === arr1.length - 1,
                            [styles.yCellLastChild]: yCoords === arr.length - 1,
                            [styles.currentUserForecast]:
                              !!forecast &&
                              userInfoData &&
                              forecastEntry &&
                              userInfoData.id === forecastEntry.user_id &&
                              !isEntryGuest &&
                              !isCellBlocked &&
                              !isPDF,
                            [styles.cellForecastLimit]:
                              (isForecastLimit ||
                                isDeadline ||
                                isFreeLimitOver) &&
                              !forecast &&
                              !winningSquares.length,
                            [styles.cellBlocked]:
                              isCellBlocked && !winningSquares.length,
                            [styles.cellWin]: !!cellWin,
                            [styles.cellBlockedResultKnown]:
                              !!winningSquares.length && !isCommissioner,
                            [styles.winningAxisCell]:
                              isCellOnWinningAxis && isHighlightResult,
                          })}
                          onClick={() => {
                            if (isDeadline) return

                            setSelectedCoords({ x: xCoords, y: yCoords })

                            if (!forecast) {
                              if (isCommissioner) {
                                setAssignMemberOrQuestModalOpen(true)
                              } else {
                                makeAForecast(xCoords, yCoords)
                                if (getCellCoordinates) {
                                  getCellCoordinates(xCoords, yCoords)
                                }
                              }
                            } else {
                              if (
                                isCommissioner ||
                                (userInfoData &&
                                  forecastEntry &&
                                  userInfoData.id === forecastEntry.user_id)
                              ) {
                                setSelectedForecast(forecast)
                                setEditMemberOrQuestModalOpen(true)
                              }
                            }
                          }}
                          onMouseOver={() =>
                            cellWin && setHighlightQuarter(cellWin)
                          }
                          onMouseOut={() => setHighlightQuarter(null)}
                        >
                          {!!forecast &&
                            forecastPoolEntry &&
                            forecastEntry &&
                            !isEntryGuest &&
                            !isPDF && (
                              <PickedBlock
                                forecastPoolEntry={forecastPoolEntry}
                                wrapperCoords={yAxisCellsWrapperCoords}
                                forecastUsername={forecastEntry.name}
                              />
                            )}

                          {forecastEntry && (isEntryGuest || isPDF) && (
                            <p
                              className={classNames(styles.forecastEntryName, {
                                [styles.forecastEntryNameCurrentUser]:
                                  !isEntryGuest && isPDF,
                              })}
                            >
                              {forecastEntry.name}
                            </p>
                          )}

                          <p
                            className={styles.clickToSelectText}
                            style={{
                              fontSize: `${calcResponseValue(
                                initialCellHoverTextFontSize,
                              )}px`,
                              lineHeight: `${calcResponseValue(
                                initialCellHoverTextLineHeight,
                              )}px`,
                            }}
                          >
                            Click to select
                          </p>

                          {isShowCellNumbers && (
                            <p className={styles.cellNumber}>
                              {xCoords + 1 + yCoords * arr1.length}
                            </p>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}

          {!isDeadline && !winningSquares.length && (
            <>
              {isForecastLimit && (
                <div className={styles.cellsTooltip}>
                  <p>
                    <span>The maximum</span> number of entries for you{' '}
                    <span>is {gridData?.max_squares_per_member ?? 0}</span>. You
                    cannot place more entries
                  </p>
                </div>
              )}

              {isFreeLimitOver && (
                <div
                  className={classNames(
                    styles.cellsTooltip,
                    styles.cellsTooltipNoMoreSquares,
                  )}
                >
                  <p>
                    You have <span>no more squares</span> available
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AssignMemberOrQuestModal
        isOpen={isAssignMemberOrQuestModalOpen}
        closeModal={() => setAssignMemberOrQuestModalOpen(false)}
        assignMemberOptions={assignMemberOptions}
        poolEntriesData={poolEntriesData}
        poolEntriesMutate={poolEntriesMutate}
        getCellCoordinates={getCellCoordinates}
        selectedCoords={selectedCoords}
        setSelectedCoords={setSelectedCoords}
        usersForManagementData={usersForManagementData}
        usersForManagementMutate={usersForManagementMutate}
        gridData={gridData}
        gridMutate={gridMutate}
        makeAForecast={makeAForecast}
        currentEntry={currentEntry}
      />

      <EditSquare
        isOpen={isEditMemberOrQuestModalOpen}
        closeModal={() => setEditMemberOrQuestModalOpen(false)}
        initialEditMemberOptions={assignMemberOptions}
        usersForManagementData={usersForManagementData}
        selectedCoords={selectedCoords}
        setSelectedCoords={setSelectedCoords}
        gridData={gridData}
        gridMutate={gridMutate}
        poolEntriesData={poolEntriesData}
        poolEntriesMutate={poolEntriesMutate}
        selectedForecast={selectedForecast}
        gridDataEntries={gridDataEntries}
        isCommissioner={isCommissioner}
      />
    </div>
  )
}

function PickedBlock({
  forecastPoolEntry,
  wrapperCoords,
  forecastUsername,
}: {
  forecastPoolEntry: SquaresEntriesItem
  wrapperCoords: DOMRect | null
  forecastUsername: string
}) {
  const retractableBlockRef = useRef<HTMLDivElement>(null)

  const propertyValue = '--retractable-block-scroll-width'

  const [retractableBlockPropertyValue, setRetractableBlockPropertyValue] =
    useState<null | number>(null)

  // вычисление настоящей максимальной ширины
  // выдвигающегося блока
  useEffect(() => {
    if (retractableBlockRef.current?.scrollWidth) {
      const retractableBlockMinWidth = 136 // px
      const retractableBlockMaxWidth = 250 // px

      const scrollWidth = retractableBlockRef.current.scrollWidth

      setRetractableBlockPropertyValue(
        scrollWidth < retractableBlockMinWidth
          ? retractableBlockMinWidth
          : scrollWidth > retractableBlockMaxWidth
          ? retractableBlockMaxWidth
          : scrollWidth,
      )
    }
  }, [retractableBlockRef])

  // если retractableBlockProperty содержит в себе цифровое значение,
  // то свойство propertyValue перепишется на актуальное
  useEffect(() => {
    if (retractableBlockRef.current && retractableBlockPropertyValue !== null) {
      retractableBlockRef.current.style.setProperty(
        propertyValue,
        retractableBlockPropertyValue + 'px',
      )
    }
  }, [retractableBlockPropertyValue, retractableBlockRef])

  const [retractableBlockIsLeft, setRetractableBlockIsLeft] = useState(false)

  // проверяет координаты выдвигающегося блока
  // и обертки грида, если y координата выдвигающегося
  // блока находится дальше y координаты
  // обертки грида, то тогда выдвигающийся блок
  // будет находится левее блока pickedBlock
  useEffect(() => {
    if (
      retractableBlockRef.current &&
      wrapperCoords &&
      retractableBlockPropertyValue !== null
    ) {
      const retractableBlockCoords =
        retractableBlockRef.current.getBoundingClientRect()

      setRetractableBlockIsLeft(
        retractableBlockCoords.right + retractableBlockPropertyValue >
          wrapperCoords.right,
      )
    }
  }, [wrapperCoords, retractableBlockRef, retractableBlockPropertyValue])

  return (
    <div
      className={styles.pickedBlock}
      style={{
        backgroundColor: !!forecastPoolEntry.color
          ? forecastPoolEntry.color
          : defaultEntryColor,
      }}
    >
      <p className={styles.cellName}>{getShortName(forecastUsername)}</p>

      <div
        ref={retractableBlockRef}
        className={classNames(styles.retractableBlock, {
          [styles.retractableBlockLeft]: retractableBlockIsLeft,
        })}
      >
        <p>{forecastUsername}</p>
      </div>
    </div>
  )
}

const modalOptions = [
  {
    title: 'Assign to a member',
    name: 'assign-to-a-member',
    description: `Option «Assign to a Member» will allow you to maintain a member roster with contact information, the number of squares assigned, and custom notes for each member`,
    isRecommended: true,
  },
  {
    title: 'Assign to a guest',
    name: 'assign-to-a-guest',
    description: `If you quickly want to enter a name for each square and don't care about anything else, the «Assign to a Guest» option will be the fastest.`,
    isRecommended: false,
  },
]

type AssignMemberOrQuestModalProps = {
  assignMemberOptions: Option[]
  poolEntriesData: SquaresEntriesItem[]
  poolEntriesMutate: KeyedMutator<ResponseData<
    EntriesPoolEntriesData<'squares'>
  > | null>
  getCellCoordinates: GridProps['getCellCoordinates']
  selectedCoords: { x: number; y: number } | null
  setSelectedCoords: Dispatch<
    SetStateAction<AssignMemberOrQuestModalProps['selectedCoords']>
  >
  usersForManagementData: UserForManagementItem[]
  usersForManagementMutate: KeyedMutator<ResponseData<UsersForManagementResponseData> | null>
  gridData: GridInfo | GolfGridInfo | undefined
  gridMutate: KeyedMutator<ResponseData<
    GridData<keyof GridResponseData>
  > | null>
  makeAForecast: (x: number, y: number, userId?: number) => Promise<void>
  currentEntry: SquaresEntriesItem | undefined
}

function AssignMemberOrQuestModal({
  isOpen,
  closeModal,
  assignMemberOptions = [],
  poolEntriesData = [],
  poolEntriesMutate,
  getCellCoordinates,
  selectedCoords,
  setSelectedCoords,
  usersForManagementData = [],
  usersForManagementMutate,
  gridData,
  gridMutate,
  makeAForecast,
  currentEntry,
}: ModalProps & AssignMemberOrQuestModalProps) {
  const [screen, setScreen] = useState<
    'default' | 'assign-to-a-member' | 'assign-to-a-guest'
  >('default')

  const [assignMemberValue, setAssignMemberValue] = useState('')

  const selectedUser = usersForManagementData.find(
    (item) => item.id === Number(assignMemberValue),
  )

  const selectedEntry = selectedUser
    ? poolEntriesData.find((entry) => entry.id === selectedUser.entries[0].id)
    : undefined

  useEffect(() => {
    if (assignMemberOptions.length && !assignMemberValue.trim()) {
      const option = assignMemberOptions.find((item) => !item.isDisabled)
      if (option) setAssignMemberValue(option.name)
    } else if (assignMemberValue.trim()) {
      const option = assignMemberOptions.find(
        (item) => item.name === assignMemberValue,
      )
      if (!option || option.isDisabled) setAssignMemberValue('')
    }
  }, [assignMemberOptions, assignMemberValue])

  const [assignMemberEntryColor, setAssignMemberEntryColor] =
    useState(defaultEntryColor)

  const [isNewMember, setIsNewMember] = useState(false)

  useEffect(() => {
    if (selectedEntry) {
      setAssignMemberEntryColor(selectedEntry.color)
    }
  }, [selectedEntry, isOpen, isNewMember])

  const defaultValues = {
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
  }

  const { control, reset, handleSubmit, watch } = useForm({ defaultValues })
  const watchFields = watch()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useMessage()

  // сбрасывает ошибку, если экран меняется
  useEffect(() => {
    setError('')
  }, [screen, setError, isNewMember])

  const [guestName, setGuestName] = useState('')

  async function sendDataAssignToMember(
    selectedUser: UserForManagementItem | undefined,
  ) {
    if (!selectedCoords || !selectedEntry || !selectedUser) return

    try {
      setIsLoading(true)

      if (selectedUser.entries.length) {
        if (makeAForecast) {
          await makeAForecast(
            selectedCoords.x,
            selectedCoords.y,
            selectedUser.entries[0].id,
          )
        }

        if (getCellCoordinates) {
          getCellCoordinates(
            selectedCoords.x,
            selectedCoords.y,
            selectedUser.entries[0].id,
          )
        }
      }

      if (selectedEntry.color !== assignMemberEntryColor) {
        await changeEntryColor(assignMemberEntryColor, selectedUser)
      }

      customCloseModal()
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
    }
  }

  async function addNewMember(data: typeof defaultValues) {
    // currentEntry нужен для поля pool_id,
    // запрос привязан к админу
    if (!currentEntry) return

    try {
      setIsLoading(true)
      const { firstname, lastname, username, email, password } = data

      const registerUserRes = await api.registerUser({
        email,
        first_name: firstname,
        last_name: lastname,
        password: password,
        password_confirmation: password,
        username: username,
        entry_name_using: false,
      })

      if (registerUserRes.error) {
        if ('message' in registerUserRes.error) {
          setError(registerUserRes.error.message)
        }

        if ('messages' in registerUserRes.error) {
          setError(registerUserRes.error.getFirstMessage())
        }

        setIsLoading(false)
        return
      }

      const attachRes = await api.pools.attachUser(currentEntry.pool_id, {
        email_or_username: email,
      })

      if (attachRes.error) {
        if ('message' in attachRes.error) {
          setError(attachRes.error.message)
        }

        if ('messages' in attachRes.error) {
          setError(attachRes.error.getFirstMessage())
        }

        setIsLoading(false)
        return
      }

      const updatedUsersData = await usersForManagementMutate()

      if (
        !!updatedUsersData?.data?.users &&
        !!registerUserRes?.data?.user?.id
      ) {
        const updatedUsers = updatedUsersData.data.users

        const selectedUser = updatedUsers.find(
          (user) => user.id === registerUserRes.data?.user?.id,
        )

        if (selectedUser) {
          sendDataAssignToMember(selectedUser)
        } else {
          setError(rf.unknownError)

          setIsLoading(false)
          return
        }
      } else {
        setError(rf.unknownError)

        setIsLoading(false)
        return
      }

      setIsLoading(false)
      customCloseModal()
    } catch (err) {
      setIsLoading(false)
    }
  }

  async function sendDataAssignToGuest() {
    // этот запрос привязан к админу
    if (!currentEntry || !guestName.trim() || !gridData || !selectedCoords)
      return

    try {
      setIsLoading(true)

      const entriesRes = await api.entries.create(currentEntry.pool_id, {
        is_guest: 1,
        name: guestName,
        user_id: currentEntry.user_id,
      })

      if (entriesRes.error) {
        writeErrorToState(entriesRes.error, setError)

        setIsLoading(false)
        return
      }

      if (entriesRes.data?.entry) {
        const res = await api.forecasts.setForecasts(
          currentEntry.pool_id,
          entriesRes.data.entry.id,
          {
            forecasts: {
              squares_grid_id: gridData.id,
              x_axis: selectedCoords.x,
              y_axis: selectedCoords.y,
            },
          },
        )

        if (res.error) {
          writeErrorToState(res.error, setError)

          setIsLoading(false)
          return
        }
      } else {
        setError(rf.unknownError)

        setIsLoading(false)
        return
      }

      await Promise.all([poolEntriesMutate(), gridMutate()])
      setIsLoading(false)
      customCloseModal()
    } catch (err) {
      setIsLoading(false)
    }
  }

  function sendData() {
    if (screen === 'assign-to-a-member') {
      if (isNewMember) {
        handleSubmit(addNewMember)()
      } else {
        sendDataAssignToMember(selectedUser)
      }
    }

    if (screen === 'assign-to-a-guest') {
      sendDataAssignToGuest()
    }
  }

  async function changeEntryColor(
    newColor: string,
    selectedUser: UserForManagementItem,
  ) {
    if (!selectedEntry || !selectedUser.entries.length) return

    try {
      const res = await api.entries.changeFields(
        selectedEntry.pool_id,
        selectedUser.entries[0].id,
        { color: newColor },
      )

      if (res.error) {
        if ('message' in res.error) {
          setError(res.error.message)
        }

        if ('messages' in res.error) {
          setError(res.error.getFirstMessage())
        }

        setIsLoading(false)
        return
      }

      await poolEntriesMutate()
      setIsLoading(false)
      customCloseModal()
    } catch (err) {
      setIsLoading(false)
    }
  }

  function customCloseModal() {
    closeModal()
    setScreen('default')
    setSelectedCoords(null)
    setIsNewMember(false)
    setGuestName('')
    setAssignMemberValue('')
  }

  function changeIsNewMember(state: boolean) {
    setIsNewMember(state)
    reset(defaultValues)
    setAssignMemberValue('')
  }

  // проверка кнопки на состояние disabled
  function checkButtonForDisabled() {
    if (screen === 'assign-to-a-member') {
      if (isNewMember) {
        const { firstname, lastname, username, email, password } = watchFields

        return (
          !firstname.trim() ||
          !lastname.trim() ||
          !username.trim() ||
          !email.trim() ||
          !password.trim()
        )
      } else {
        return !assignMemberValue.trim() || !assignMemberEntryColor.trim()
      }
    } else {
      return !guestName.trim()
    }
  }

  const handlingAssignMemberOptions = assignMemberOptions.map((item) => ({
    ...item,
    title: item.title + (item.isDisabled ? ' (limit reached)' : ''),
  }))

  return (
    <Modal isOpen={isOpen} closeModal={customCloseModal}>
      <div className={styles.assignModalWrapper}>
        <div className={styles.cross} onClick={customCloseModal}>
          <Cross />
        </div>

        {screen === 'default' ? (
          <>
            <p className={styles.assignModalTitle}>Select an option</p>

            <div className={styles.assignOptionsWrapper}>
              {modalOptions.map((item, i) => (
                <div key={i} className={styles.assignOptionWrapper}>
                  {item.isRecommended && (
                    <p className={styles.assignRecommendedText}>Recommended</p>
                  )}
                  <div
                    className={styles.assignOption}
                    onClick={() => {
                      if (
                        item.name === 'assign-to-a-member' ||
                        item.name === 'assign-to-a-guest'
                      ) {
                        setScreen(item.name)
                      }
                    }}
                  >
                    <div className={styles.assignOptionTitleAndDescription}>
                      <p className={styles.assignOptionTitle}>{item.title}</p>
                      <p className={styles.assignOptionDescription}>
                        {item.description}
                      </p>
                    </div>
                    <MonthRightArrow />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.assignMemberOrGuestWrapper}>
            <p
              className={styles.assignMemberOrGuestTitle}
              onClick={() => {
                setScreen('default')
                changeIsNewMember(false)
                setGuestName('')
              }}
            >
              <MonthLeftArrow /> Back to select
            </p>

            <div className={styles.assignMemberOrGuestContainer}>
              <p className={styles.assignMemberOrGuestContainerTitle}>
                Assign to a{' '}
                {screen === 'assign-to-a-member' ? 'member' : 'guest'}
              </p>

              {!!error && (
                <div className="alert alert-danger alert-small">{error}</div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!checkButtonForDisabled() && !isLoading) sendData()
                }}
              >
                <div className={styles.customValues}>
                  {screen === 'assign-to-a-member' && (
                    <>
                      {!isNewMember ? (
                        <div className={styles.notNewMemberForm}>
                          <div className={styles.assignMemberForm}>
                            <Select
                              value={assignMemberValue}
                              onChange={setAssignMemberValue}
                              options={handlingAssignMemberOptions}
                              placeholder="Username"
                            />

                            <ColorPicker
                              value={assignMemberEntryColor}
                              onChange={setAssignMemberEntryColor}
                            />
                          </div>

                          <p className={styles.dontSeeMemberListedText}>
                            Don’t see a member listed?{' '}
                            <span onClick={() => changeIsNewMember(true)}>
                              Add a new member
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div className={styles.newMembersForm}>
                          <div className={styles.newMembersFormTwoColumns}>
                            <RHFInput
                              control={control}
                              name="firstname"
                              placeholder="First Name"
                              required
                            />

                            <RHFInput
                              control={control}
                              name="lastname"
                              placeholder="Last Name"
                              required
                            />
                          </div>

                          <RHFInput
                            control={control}
                            name="username"
                            placeholder="Username"
                            required
                          />

                          <RHFInput
                            control={control}
                            name="email"
                            placeholder="Email"
                            required
                          />

                          <RHFInput
                            control={control}
                            name="password"
                            placeholder="Password"
                            required
                          />

                          <div className={styles.chooseEntryColor}>
                            <p>Сhoose entry color</p>
                            <ColorPicker
                              value={assignMemberEntryColor}
                              onChange={setAssignMemberEntryColor}
                            />
                          </div>

                          <p className={styles.alreadyHaveMemberText}>
                            Already have a member?{' '}
                            <span onClick={() => changeIsNewMember(false)}>
                              Assign to a member
                            </span>
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {screen === 'assign-to-a-guest' && (
                    <div className={styles.assignToGuestWrapper}>
                      <Input
                        value={guestName}
                        onChange={setGuestName}
                        placeholder="Guest name"
                        className={styles.assignToGuestInput}
                      />
                      <p className={styles.assignToGuestText}>
                        Enter the name that will be displayed in the grid
                      </p>
                    </div>
                  )}
                </div>

                <button
                  className={classNames('button button-blue-light', {
                    disabled: isLoading || checkButtonForDisabled(),
                  })}
                >
                  {screen === 'assign-to-a-member'
                    ? isNewMember
                      ? 'Add a Member & Assign square'
                      : 'Assing to Member'
                    : 'Assing to Guest'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

type EditSquareProps = {
  usersForManagementData: UserForManagementItem[]
  initialEditMemberOptions: Option[]
  selectedCoords: { x: number; y: number } | null
  setSelectedCoords: Dispatch<
    SetStateAction<AssignMemberOrQuestModalProps['selectedCoords']>
  >
  gridData: GridInfo | GolfGridInfo | undefined
  gridMutate: KeyedMutator<ResponseData<
    GridData<keyof GridResponseData>
  > | null>
  poolEntriesData: SquaresEntriesItem[]
  poolEntriesMutate: KeyedMutator<ResponseData<
    EntriesPoolEntriesData<'squares'>
  > | null>
  selectedForecast: GridInfoForecastItem | null
  gridDataEntries: GridDataEntryItem[]
  isCommissioner: boolean
}

function EditSquare({
  isOpen,
  closeModal,
  usersForManagementData,
  initialEditMemberOptions,
  selectedCoords,
  setSelectedCoords,
  gridData,
  gridMutate,
  poolEntriesData,
  poolEntriesMutate,
  selectedForecast,
  gridDataEntries,
  isCommissioner,
}: ModalProps & EditSquareProps) {
  const [editMemberValue, setEditMemberValue] = useState('')

  // пользователь, выбранный из списка
  const selectedUser = usersForManagementData.find(
    (item) => item.id === Number(editMemberValue),
  )

  // запись, которая выбрана исходя из пользователя в списке
  const selectedUserEntry = selectedUser
    ? poolEntriesData.find((entry) => entry.id === selectedUser.entries[0].id)
    : undefined

  const entryId =
    gridData && selectedCoords
      ? gridData.forecasts.find(
          (forecast) =>
            forecast.x_axis === selectedCoords.x &&
            forecast.y_axis === selectedCoords.y,
        )?.entry_id
      : undefined

  // запись, которая на данный момент находится в гриде
  const selectedEntry = poolEntriesData.find(
    (entry) => entry.id === Number(entryId),
  )

  useEffect(() => {
    if (
      initialEditMemberOptions.length &&
      selectedForecast &&
      gridDataEntries.length
    ) {
      const selectedUser = gridDataEntries.find(
        (item) => item.id === selectedForecast.entry_id,
      )

      if (selectedUser) {
        const selectedOption = initialEditMemberOptions.find(
          (item) => item.name === String(selectedUser.user_id),
        )

        if (selectedOption) setEditMemberValue(selectedOption.name)
      }
    }
  }, [isOpen, initialEditMemberOptions, selectedForecast, gridDataEntries])

  const [editMemberEntryColor, setEditMemberEntryColor] =
    useState(defaultEntryColor)

  useEffect(() => {
    if (selectedUserEntry) {
      setEditMemberEntryColor(selectedUserEntry.color)
    }
  }, [selectedUserEntry, isOpen])

  const [editError, setEditError] = useMessage()

  const [deleteIsLoading, setDeleteIsLoading] = useState(false)
  const [saveChangesIsLoading, setSaveChangesIsLoading] = useState(false)

  async function deleteForecast(isSaveChanges = false) {
    if (!gridData || !selectedCoords || !selectedEntry) return

    try {
      setDeleteIsLoading(true)

      const res = await api.forecasts.delete(
        selectedEntry.pool_id,
        selectedEntry.id,
        {
          forecasts: {
            squares_grid_id: gridData.id,
            x_axis: selectedCoords.x,
            y_axis: selectedCoords.y,
          },
        },
      )

      if (res.error) {
        if ('message' in res.error) {
          setEditError(res.error.message)
        }

        if ('messages' in res.error) {
          setEditError(res.error.getFirstMessage())
        }

        setDeleteIsLoading(false)
        return
      }

      await Promise.all([poolEntriesMutate(), gridMutate()])
      setDeleteIsLoading(false)

      if (!isSaveChanges) {
        customCloseModal()
      } else {
        return 'success'
      }
    } catch (err) {
      setDeleteIsLoading(false)
    }
  }

  async function saveChanges() {
    if (
      !selectedUser ||
      !gridData ||
      !selectedCoords ||
      !selectedEntry ||
      !selectedUserEntry
    )
      return

    try {
      setSaveChangesIsLoading(true)

      if (editMemberValue !== String(selectedEntry.user_id)) {
        const status = await deleteForecast(true)

        if (status === 'success') {
          const res = await api.forecasts.setForecasts(
            selectedUser.pool_id,
            selectedUser.entries[0].id,
            {
              forecasts: {
                squares_grid_id: gridData.id,
                x_axis: selectedCoords.x,
                y_axis: selectedCoords.y,
              },
            },
          )

          if (res.error) {
            if ('message' in res.error) {
              setEditError(res.error.message)
            }

            if ('messages' in res.error) {
              setEditError(res.error.getFirstMessage())
            }

            setSaveChangesIsLoading(false)
            return
          }
        }
      }

      if (selectedUserEntry.color !== editMemberEntryColor) {
        await changeEntryColor(editMemberEntryColor)
      }

      await Promise.all([poolEntriesMutate(), gridMutate()])
      setSaveChangesIsLoading(false)
      customCloseModal()
    } catch (err) {
      setSaveChangesIsLoading(false)
    }
  }

  async function guestSaveChanges() {
    if (!selectedUser || !selectedEntry) return
    try {
      setSaveChangesIsLoading(true)

      const res = await api.entries.changeFields(
        selectedUser.pool_id,
        selectedEntry.id,
        { name: guestName.trim() },
      )

      if (res.error) {
        if ('message' in res.error) {
          setEditError(res.error.message)
        }

        if ('messages' in res.error) {
          setEditError(res.error.getFirstMessage())
        }

        setSaveChangesIsLoading(false)
        return
      }

      await Promise.all([poolEntriesMutate(), gridMutate()])
      customCloseModal()
      setSaveChangesIsLoading(false)
    } catch (err) {
      setSaveChangesIsLoading(false)
    }
  }

  async function changeEntryColor(newColor: string) {
    if (!selectedEntry || !selectedUser) return

    try {
      const res = await api.entries.changeFields(
        selectedEntry.pool_id,
        selectedUser.entries[0].id,
        { color: newColor },
      )

      if (res.error) {
        if ('message' in res.error) {
          setEditError(res.error.message)
        }

        if ('messages' in res.error) {
          setEditError(res.error.getFirstMessage())
        }
      }
    } catch (err) {
      if (
        !!err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof err.message === 'string'
      ) {
        setEditError(err.message)
      }
    }
  }

  function customCloseModal() {
    setSelectedCoords(null)
    closeModal()
  }

  const [guestName, setGuestName] = useState('')

  useEffect(() => {
    if (selectedEntry) {
      setGuestName(selectedEntry.name)
    }
  }, [selectedEntry])

  const isSaveChangesDisabled = selectedEntry?.is_guest
    ? !guestName.trim() || selectedEntry.name === guestName.trim()
    : selectedEntry?.color === editMemberEntryColor &&
      editMemberValue === String(selectedEntry?.user_id)

  const editMemberOptions =
    selectedUser && selectedEntry && initialEditMemberOptions.length
      ? initialEditMemberOptions.map((item) => {
          if (
            item.name === String(selectedUser.id) ||
            item.name === String(selectedEntry.user_id)
          ) {
            return { ...item, isDisabled: false }
          }

          return {
            ...item,
            title: item.title + (item.isDisabled ? ' (limit reached)' : ''),
          }
        })
      : initialEditMemberOptions

  return (
    <Modal isOpen={isOpen} closeModal={customCloseModal}>
      {selectedEntry && (
        <div className={styles.editModalWrapper}>
          <div className={styles.editModalCross} onClick={customCloseModal}>
            <Cross />
          </div>

          <p className={styles.editModalTitle}>Edit square</p>

          {editError && (
            <div className="alert alert-danger alert-small">{editError}</div>
          )}

          <div className={styles.editModalFormWrapper}>
            {isCommissioner ? (
              selectedEntry.is_guest ? (
                <div>
                  <Input
                    value={guestName}
                    onChange={setGuestName}
                    placeholder="Enter the Guest name"
                  />
                </div>
              ) : (
                <>
                  <Select
                    value={editMemberValue}
                    onChange={setEditMemberValue}
                    options={editMemberOptions}
                    placeholder="Username"
                  />

                  <ColorPicker
                    value={editMemberEntryColor}
                    onChange={setEditMemberEntryColor}
                  />
                </>
              )
            ) : (
              <p>
                Are you sure you want to remove the member &quot;
                {selectedEntry.name}&quot; from this square?
              </p>
            )}
          </div>

          {isCommissioner ? (
            <div className={styles.editModalButtonsWrapper}>
              <button
                className={classNames('button button-red-outline', {
                  disabled: deleteIsLoading || !isSaveChangesDisabled,
                })}
                onClick={() => deleteForecast()}
              >
                Delete
              </button>

              <button
                className={classNames('button button-blue-light', {
                  disabled: isSaveChangesDisabled || saveChangesIsLoading,
                })}
                onClick={() =>
                  selectedEntry.is_guest ? guestSaveChanges() : saveChanges()
                }
              >
                Save Changes
              </button>
            </div>
          ) : (
            <button
              className={classNames(
                'button button-red-outline',
                styles.notCommissionerBtn,
                { disabled: deleteIsLoading },
              )}
              onClick={() => deleteForecast()}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </Modal>
  )
}
