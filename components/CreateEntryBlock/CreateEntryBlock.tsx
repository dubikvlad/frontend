import classNames from 'classnames'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { PoolTypes } from '@/api'
import { Cross } from '@/assets/icons'
import { createEntry, routes } from '@/config/constants'
import { Input } from '@/features/ui'
import {
  useGetPoolEntries,
  useGetPoolUsers,
  useGetUser,
  useMessage,
  usePool,
} from '@/helpers'

import styles from './CreateEntryBlock.module.scss'

type CreateEntryBlockProps = {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  wrapperClassName?: string
  customUserId?: number
  weekNumber?: number
  actionAfterEntryCreation?: () => void
}

export function CreateEntryBlock({
  isOpen,
  setIsOpen,
  wrapperClassName = '',
  customUserId,
  weekNumber,
  actionAfterEntryCreation,
}: CreateEntryBlockProps) {
  const {
    push,
    query: { poolId },
  } = useRouter()

  const { userData } = useGetUser()
  const { poolData } = usePool(poolId ? Number(poolId) : undefined)

  const { poolUsersData } = useGetPoolUsers(
    customUserId && poolData ? poolData.id : undefined,
  )

  const actualUserData = customUserId
    ? poolUsersData.find((user) => user.id === customUserId) ?? userData
    : userData

  const {
    poolEntriesData,
    poolEntriesIsLoading,
    poolEntriesMutate: currentUserPoolEntriesMutate,
  } = useGetPoolEntries<PoolTypes>({
    poolId: poolData?.id,
    userId: actualUserData?.id,
    weekNumber,
  })

  const { poolEntriesMutate } = useGetPoolEntries<PoolTypes>({
    poolId: poolData?.id,
  })

  const [entryName, setEntryName] = useState('')

  useEffect(() => {
    if (actualUserData)
      setEntryName(
        `${actualUserData.display_name} #${poolEntriesData.length + 1}`,
      )
  }, [poolEntriesData, actualUserData, isOpen])

  const [createEntryIsLoading, setCreateEntryIsLoading] =
    useState<boolean>(false)

  const [error, setError] = useMessage()

  if (!poolData) return null

  return (
    <div
      className={classNames(styles.createEntryWrapper, {
        [styles.createEntryWrapperOpen]: isOpen,
        [wrapperClassName]: wrapperClassName,
      })}
    >
      <div className={styles.createEntryNameWrapper}>
        <p>Name your entry</p>

        {error && (
          <div
            className={classNames(
              'alert alert-danger alert-small',
              styles.alertDanger,
            )}
          >
            {error}
          </div>
        )}

        <div className={styles.createEntryInputWrapper}>
          <Input
            className={styles.createEntryInput}
            value={entryName}
            onChange={setEntryName}
            placeholder="Entry Name"
          />
          <button
            className={classNames('button button-blue-light', {
              disabled:
                createEntryIsLoading ||
                poolEntriesIsLoading ||
                !entryName.trim(),
            })}
            onClick={() =>
              createEntry({
                poolData,
                userData,
                poolEntriesData,
                setCreateEntryIsLoading,
                mutateArray: [poolEntriesMutate, currentUserPoolEntriesMutate],
                setError,
                createEntryIsLoading,
                customNewEntryName: entryName,
                actionAfterEntryCreation: (entryId) => {
                  if (actionAfterEntryCreation) actionAfterEntryCreation()

                  push(
                    routes.account.makePick.index(poolData.id, {
                      entry_id: entryId,
                    }),
                  )
                },
              })
            }
          >
            Make a Pick
          </button>
        </div>
      </div>

      <div className={styles.createEntryNotificationWrapper}>
        <p className={styles.createEntryNotificationTitle}>Notification</p>

        <p>
          You can change the name and parameters of the future entry in your
          pool settings
        </p>
      </div>

      <div className={styles.cross} onClick={() => setIsOpen(false)}>
        <Cross />
      </div>
    </div>
  )
}
