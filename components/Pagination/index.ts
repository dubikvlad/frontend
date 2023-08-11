export { Pagination } from './Pagination'

export type TPagination = {
  totalRows: number
  rowsPerPage?: number
  currentPage: number
  onChangePage: (currentPage: number) => void
  groupCount?: number
}

export type TPaginationItem = {
  currentPage: TPagination['currentPage']
  index: number
  rowsOnPage: string
  onChangePage: TPagination['onChangePage']
}

export type TButton = {
  currentPage: TPagination['currentPage']
  onChangePage: TPagination['onChangePage']
  paginateButtonsCount?: number
}

export type TDefaultGroup = {
  paginateButtonsCount: number
  rowsPerPage: number
  totalRows: TPagination['totalRows']
  currentPage: TPagination['currentPage']
  onChangePage: TPagination['onChangePage']
}

export type TDynamicButtons = {
  groupCount: number
  rowsPerPage: number
  onChangePage: TPagination['onChangePage']
  totalRows: TPagination['totalRows']
  currentPage: TPagination['currentPage']
  paginateButtonsCount: number
}

export type TReturnRowsOnPage = {
  rowsPerPage: number
  totalRows: TPagination['totalRows']
  index: number
}
