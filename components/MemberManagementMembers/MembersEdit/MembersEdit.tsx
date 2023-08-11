import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

import { api, UserForManagementItem } from '@/api'
import { Switcher } from '@/features/ui'
import { useUsersForManagement } from '@/helpers'

import styles from './MembersEdit.module.scss'

export function MembersEdit({
  userData,
  isEdit,
}: {
  userData: UserForManagementItem
  isEdit: boolean
}) {
  const [isActive, setIsAsctive] = useState(
    userData.commissioner ? true : !!userData.active,
  )

  const {
    query: { poolId },
  } = useRouter()

  const { usersForManagementMutate } = useUsersForManagement(Number(poolId))

  const editContainer = useRef<HTMLDivElement>(null)

  async function sendData(name: string, value: boolean) {
    const result = {
      [userData.id]: {
        [name]: value,
      },
    }

    await api.pools.editUsers(Number(poolId), result)

    usersForManagementMutate()
  }

  useEffect(() => {
    if (isEdit && editContainer.current) {
      const elHeight = editContainer.current?.scrollHeight

      editContainer.current.style.maxHeight = `${elHeight}px`
    } else if (editContainer.current && !isEdit) {
      editContainer.current.style.maxHeight = `0px`
    }
  }, [isEdit])

  return (
    <tr className={styles.wrapper}>
      <td colSpan={6}>
        <div
          className={classNames(styles.container, {
            [styles.active]: isEdit,
          })}
          ref={editContainer}
        >
          <div className={styles.editWrapper}>
            <div className={styles.editContainer}>
              <div className={styles.switcherWrapper}>
                {/*
                  // todo: изменение comissioner не реализовано на бэке
                */}
                <Switcher
                  value={!!userData.commissioner}
                  onChange={() => {
                    return null
                  }}
                />
                <p>Commissioner</p>
              </div>
              <div className={styles.switcherWrapper}>
                <Switcher
                  value={!!userData.commissioner ? true : isActive}
                  onChange={
                    !!userData.commissioner
                      ? () => {
                          return null
                        }
                      : setIsAsctive
                  }
                  onChangeEvent={() => {
                    !userData.commissioner && sendData('is_active', !isActive)
                  }}
                />
                <p
                  className={classNames({
                    [styles.disabled]: !!userData.commissioner,
                  })}
                >
                  {!!userData.commissioner
                    ? 'The pool commissioner is always active'
                    : 'Active'}
                </p>
              </div>
            </div>
            <div className={styles.editContainer}>
              <div className={styles.text}>
                <span>Membership ID:</span>
                <span>{userData.pool_user_id}</span>
              </div>
              <p className={styles.text}>
                <span>Display Name:</span>
                <span>{userData.display_name}</span>
              </p>
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}
