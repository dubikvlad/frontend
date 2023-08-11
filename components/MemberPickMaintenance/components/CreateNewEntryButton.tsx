import classNames from 'classnames'

import styles from './../MemberPickMaintenance.module.scss'

type CreateNewEntryButtonProps = {
  createEntryIsDisabled: boolean
  createNewEntry: () => void
}

export function CreateNewEntryButton({
  createEntryIsDisabled,
  createNewEntry,
}: CreateNewEntryButtonProps) {
  return (
    <div
      className={classNames(styles.createNewEntryButton, {
        [styles.createNewEntryButtonDisabled]: createEntryIsDisabled,
      })}
      onClick={() => !createEntryIsDisabled && createNewEntry()}
    >
      + Create New Entry
    </div>
  )
}
