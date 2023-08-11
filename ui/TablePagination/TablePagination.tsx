import classNames from 'classnames'
import React, { Dispatch, Fragment, SetStateAction } from 'react'

import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'

import styles from './TablePagination.module.scss'

export function TablePagination({
  activePage,
  pagesArray,
  handleChangePage,
  activeIndex,
}: {
  activePage: number
  pagesArray: number[]
  handleChangePage: Dispatch<SetStateAction<number>>
  activeIndex: number
}) {
  if (!pagesArray.length) return <></>

  return (
    <div className={styles.container}>
      <div className={styles.buttonsWrap}>
        <button
          onClick={() => handleChangePage(--activePage)}
          className={classNames(styles.btn, {
            [styles.disabled]: activeIndex === 0,
          })}
        >
          <MonthLeftArrow />
        </button>

        {pagesArray.length > 6 ? (
          <Custom
            activePage={activePage}
            pagesArray={pagesArray}
            handleChangePage={handleChangePage}
            activeIndex={activeIndex}
          />
        ) : (
          <Default
            activePage={activePage}
            pagesArray={pagesArray}
            handleChangePage={handleChangePage}
          />
        )}

        <button
          onClick={() => {
            handleChangePage(++activePage)
          }}
          className={classNames(styles.btn, {
            [styles.disabled]: activeIndex === pagesArray.length - 1,
          })}
        >
          <MonthRightArrow />
        </button>
      </div>
    </div>
  )
}

function Custom({
  activePage,
  pagesArray,
  handleChangePage,
  activeIndex,
}: {
  activePage: number
  pagesArray: number[]
  handleChangePage: Dispatch<SetStateAction<number>>
  activeIndex: number
}) {
  const arrayForRender: number[] = generateCustomArray({
    pagesArray,
    activeIndex,
  })

  return (
    <>
      {arrayForRender.map((p: number, btnIndex: number) => {
        const leftEllipsis = btnIndex === 1 && activeIndex > 2

        const rightEllipsis =
          btnIndex === 4 && activeIndex < pagesArray.length - 3

        return (
          <Fragment key={p}>
            {leftEllipsis ? <div className={styles.ellipsis}>...</div> : <></>}

            {rightEllipsis ? <div className={styles.ellipsis}>...</div> : <></>}

            <Btn
              page={p}
              activePage={activePage}
              handleChangePage={handleChangePage}
            />
          </Fragment>
        )
      })}
    </>
  )
}

const generateCustomArray = ({
  pagesArray,
  activeIndex,
}: {
  pagesArray: number[]
  activeIndex: number
}) => {
  const start = pagesArray[0]

  const end = [...pagesArray][pagesArray.length - 1]

  if (activeIndex >= 3) {
    if (activeIndex > pagesArray.length - 4) {
      //with ellipsis on the left

      return [start, ...[...pagesArray].slice(pagesArray.length - 4)]
    }
    const middle = [...pagesArray].slice(activeIndex - 1, activeIndex + 2)

    //with ellipsis on both sides
    return [start, ...middle, end]
  } else {
    //with ellipsis on the right
    return [...[...pagesArray].slice(0, 4), pagesArray.length]
  }
}

function Default({
  activePage,
  pagesArray,
  handleChangePage,
}: {
  activePage: number
  pagesArray: number[]
  handleChangePage: Dispatch<SetStateAction<number>>
}) {
  return (
    <>
      {pagesArray.map((p: number) => (
        <Btn
          key={p}
          page={p}
          activePage={activePage}
          handleChangePage={handleChangePage}
        />
      ))}
    </>
  )
}

function Btn({
  page,
  activePage,
  handleChangePage,
}: {
  page: number
  activePage: number
  handleChangePage: (p: number) => void
}) {
  return (
    <button
      onClick={() => {
        handleChangePage(page)
      }}
      key={page}
      className={classNames(styles.btn, {
        [styles.current]: activePage === page,
      })}
    >
      {page}
    </button>
  )
}
