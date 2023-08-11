import classNames from 'classnames'

import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'

import styles from './Pagination.module.scss'

import type {
  TPagination,
  TPaginationItem,
  TButton,
  TDefaultGroup,
  TDynamicButtons,
  TReturnRowsOnPage,
} from './index'

export function Pagination({
  // общее количесво пунктов/строк которые будут доступны
  totalRows,
  // количество пунктов/строк на одной странице
  rowsPerPage,
  // текущая страница
  currentPage = 1,
  // ф-ция изменения страницы
  onChangePage,
  // максимальное количество кнопок пагинации на странице groupCount + 2
  // также количество кнопок в группе в DynamicList
  groupCount = 3,
}: TPagination) {
  const rowsPerPageCheked = rowsPerPage ? rowsPerPage : 20

  const paginateButtonsCount = totalRows
    ? Math.ceil(totalRows / rowsPerPageCheked)
    : 0

  return (
    <div className={styles.wrapper}>
      <PrevButton currentPage={currentPage} onChangePage={onChangePage} />
      {paginateButtonsCount <= groupCount + 2 ? (
        <DefaultButtons
          paginateButtonsCount={paginateButtonsCount}
          rowsPerPage={rowsPerPageCheked}
          totalRows={totalRows}
          onChangePage={onChangePage}
          currentPage={currentPage}
        />
      ) : (
        <DynamicButtons
          groupCount={groupCount}
          rowsPerPage={rowsPerPageCheked}
          onChangePage={onChangePage}
          totalRows={totalRows}
          currentPage={currentPage}
          paginateButtonsCount={paginateButtonsCount}
        />
      )}

      <NextButton
        currentPage={currentPage}
        onChangePage={onChangePage}
        paginateButtonsCount={paginateButtonsCount}
      />
    </div>
  )
}

function PaginationItem({
  currentPage,
  index,
  rowsOnPage,
  onChangePage,
}: TPaginationItem) {
  return (
    <div
      key={index}
      className={classNames(styles.page, {
        [styles.active]: currentPage === index + 1,
      })}
      onClick={() => onChangePage(index + 1)}
    >
      {rowsOnPage}
    </div>
  )
}

function PrevButton({ currentPage, onChangePage }: TButton) {
  return (
    <button
      className={classNames('button-pagination pag-prev fit', {
        ['pag-active']: currentPage !== 1,
      })}
      onClick={() => currentPage !== 1 && onChangePage(currentPage - 1)}
    >
      <MonthLeftArrow height={9} className="pagination-arrow" />
      Previous
    </button>
  )
}

function NextButton({
  currentPage,
  paginateButtonsCount,
  onChangePage,
}: TButton) {
  return (
    <button
      className={classNames('button-pagination pag-next fit', {
        ['pag-active']: currentPage !== paginateButtonsCount,
      })}
      onClick={() =>
        currentPage !== paginateButtonsCount && onChangePage(currentPage + 1)
      }
    >
      Next
      <MonthRightArrow height={9} className="pagination-arrow" />
    </button>
  )
}

function DefaultButtons({
  paginateButtonsCount,
  rowsPerPage,
  totalRows,
  currentPage,
  onChangePage,
}: TDefaultGroup) {
  return (
    <div className={styles.pages}>
      {[...Array(paginateButtonsCount).keys()].map((i) => {
        const rowsOnPage = returnRowsOnPage({
          rowsPerPage,
          totalRows,
          index: i,
        })

        return (
          <PaginationItem
            key={i}
            index={i}
            rowsOnPage={rowsOnPage}
            onChangePage={onChangePage}
            currentPage={currentPage}
          />
        )
      })}
    </div>
  )
}

function returnRowsOnPage({
  rowsPerPage,
  totalRows,
  index,
}: TReturnRowsOnPage) {
  const isLastPage = rowsPerPage * (index + 1) > totalRows

  return `${rowsPerPage * index + 1} - ${
    isLastPage ? totalRows : rowsPerPage * index + rowsPerPage
  }`
}

function DynamicButtons({
  groupCount,
  rowsPerPage,
  onChangePage,
  totalRows,
  currentPage,
  paginateButtonsCount,
}: TDynamicButtons) {
  function StartGroup() {
    return (
      <>
        {[...Array(groupCount).keys()].map((i) => (
          <PaginationItem
            key={i}
            index={i + 1}
            rowsOnPage={returnRowsOnPage({
              rowsPerPage,
              totalRows,
              index: i + 1,
            })}
            onChangePage={onChangePage}
            currentPage={currentPage}
          />
        ))}

        {paginateButtonsCount - currentPage > groupCount - 1 && <DotsGroup />}
      </>
    )
  }

  function MiddleGroup() {
    const count = Math.floor(groupCount / 2)

    return (
      <>
        {currentPage > groupCount && <DotsGroup />}
        {[...Array(groupCount).keys()].map((i) => (
          <PaginationItem
            key={i}
            index={currentPage - count + i - 1}
            rowsOnPage={returnRowsOnPage({
              rowsPerPage,
              totalRows,
              index: currentPage - count + i - 1,
            })}
            onChangePage={onChangePage}
            currentPage={currentPage}
          />
        ))}
        {paginateButtonsCount - currentPage > groupCount - 1 && <DotsGroup />}
      </>
    )
  }

  function EndGroup() {
    const count = groupCount + 1

    return (
      <>
        {currentPage >= count && <DotsGroup />}

        {[...Array(groupCount).keys()].map((i) => (
          <PaginationItem
            key={i}
            index={paginateButtonsCount - count + i}
            rowsOnPage={returnRowsOnPage({
              rowsPerPage,
              totalRows,
              index: paginateButtonsCount - count + i,
            })}
            onChangePage={onChangePage}
            currentPage={currentPage}
          />
        ))}
      </>
    )
  }

  function DotsGroup() {
    return <div className={styles.dots}>...</div>
  }

  return (
    <div className={styles.pages}>
      <PaginationItem
        index={0}
        rowsOnPage={returnRowsOnPage({
          rowsPerPage,
          totalRows,
          index: 0,
        })}
        onChangePage={onChangePage}
        currentPage={currentPage}
      />
      {currentPage < groupCount + 1 ? (
        <StartGroup />
      ) : currentPage > paginateButtonsCount - groupCount &&
        currentPage <= paginateButtonsCount ? (
        <EndGroup />
      ) : (
        <MiddleGroup />
      )}
      <PaginationItem
        index={paginateButtonsCount - 1}
        rowsOnPage={returnRowsOnPage({
          rowsPerPage,
          totalRows,
          index: paginateButtonsCount - 1,
        })}
        onChangePage={onChangePage}
        currentPage={currentPage}
      />
    </div>
  )
}
