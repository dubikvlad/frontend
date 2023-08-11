import classNames from 'classnames'
import Link from 'next/link'
import { Dispatch, SetStateAction, useEffect } from 'react'

import { Pencil, ChangeCircle, DeleteForever } from '@/assets/icons'

import styles from './EntrySettings.module.scss'

type EntrySettingsProps = {
  dropdownIsOpen: boolean
  setDropdownIsOpen: Dispatch<SetStateAction<boolean>>
  showConfirmDeletion: boolean
  setShowConfirmDeletion: Dispatch<SetStateAction<boolean>>
  editEntryLink?: string
  renameAction: () => void
  deleteAction: () => void
  wrapperClassName?: string
}

export function EntrySettings({
  dropdownIsOpen = false,
  setDropdownIsOpen,
  showConfirmDeletion = false,
  setShowConfirmDeletion,
  editEntryLink = '#',
  renameAction,
  deleteAction,
  wrapperClassName = '',
}: EntrySettingsProps) {
  useEffect(() => {
    if (setShowConfirmDeletion) setShowConfirmDeletion(false)
  }, [dropdownIsOpen, setShowConfirmDeletion])

  return (
    <div
      className={classNames(styles.entrySettingsList, {
        [styles.entrySettingsListIsOpen]: dropdownIsOpen,
        [styles.confirmDeletion]: showConfirmDeletion,
        [wrapperClassName]: !!wrapperClassName,
      })}
    >
      <Link href={editEntryLink} className={styles.entrySettingsListItem}>
        <Pencil className={styles.entryPencil} />
        <p>Edit Entry</p>
      </Link>

      <div
        className={styles.entrySettingsListItem}
        onClick={() => {
          setDropdownIsOpen(false)
          if (renameAction) renameAction()
        }}
      >
        <ChangeCircle className={styles.entryChangeCircle} />
        <p>Rename Entry</p>
      </div>

      <div
        className={classNames(
          styles.entrySettingsListItem,
          styles.confirmDeletionItem,
        )}
        onClick={() => setShowConfirmDeletion((prev) => !prev)}
      >
        <DeleteForever className={styles.entryDeleteForever} />
        <p>
          {showConfirmDeletion
            ? 'Do you want to delete the entry?'
            : 'Delete Entry'}
        </p>
      </div>

      {showConfirmDeletion && (
        <p className={styles.deleteText}>
          <span
            onClick={() => {
              if (deleteAction) deleteAction()
              setDropdownIsOpen(false)
            }}
          >
            Delete
          </span>
        </p>
      )}
    </div>
  )
}
