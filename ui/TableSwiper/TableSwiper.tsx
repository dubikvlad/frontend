import classNames from 'classnames'
import React, {
  Dispatch,
  isValidElement,
  memo,
  SetStateAction,
  useMemo,
} from 'react'

import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'

import styles from './TableSwiper.module.scss'

type ItemType = string | number | JSX.Element | null

type IndicesType = {
  first: number
  last: number
}

const isItemString = (item: ItemType): item is string =>
  typeof item === 'string'

const isItemNumber = (item: ItemType): item is number =>
  typeof item === 'number'

const isItemJSXElement = (item: ItemType): item is JSX.Element =>
  isValidElement(item)

function TableSwiperToMemo({
  items,
  itemsCount = 3,
  onChangeCallback,
  itemIndices,
  setItemIndices,
  className,
}: {
  items: ItemType[]
  onChangeCallback?: (
    shownItems: ItemType[],
    indices: { first: number; last: number },
  ) => void
  itemsCount?: number
  itemIndices: IndicesType
  setItemIndices: Dispatch<SetStateAction<IndicesType>>
  className?: string
}) {
  const onNextClick = () => {
    if (itemIndices.last === items.length - 1) return

    const newIndices = {
      first: itemIndices.first + 1,
      last: itemIndices.last + 1,
    }

    setItemIndices(newIndices)
    onChangeCallback && onChangeCallback(currentItems, itemIndices)
  }

  const onPrevClick = () => {
    if (itemIndices.first === 0) return

    const newIndices = {
      first: itemIndices.first - 1,
      last: itemIndices.last - 1,
    }

    setItemIndices(newIndices)
    onChangeCallback && onChangeCallback(currentItems, itemIndices)
  }

  const currentItems = useMemo(() => {
    return items.slice(itemIndices.first, itemIndices.last + 1)
  }, [itemIndices.first, itemIndices.last, items])

  return (
    <div className={styles.swiper}>
      <div
        className={classNames(styles.arrowContainer, {
          [styles.disabled]: itemIndices.first === 0,
        })}
        onClick={onPrevClick}
      >
        <MonthLeftArrow />
      </div>
      <div
        className={styles.inside}
        style={{ gridTemplateColumns: `repeat(${itemsCount}, 1fr)` }}
      >
        {currentItems.map((item, index) => {
          if (isItemString(item) || isItemNumber(item)) {
            return (
              <div key={index} className={classNames(styles.item, className)}>
                {item}
              </div>
            )
          }

          if (isItemJSXElement(item)) {
            return item
          }
        })}
      </div>

      <div
        className={classNames(styles.arrowContainer, {
          [styles.disabled]: itemIndices.last >= items.length - 1,
        })}
        onClick={onNextClick}
      >
        <MonthRightArrow />
      </div>
    </div>
  )
}

export const TableSwiper = memo(TableSwiperToMemo)
