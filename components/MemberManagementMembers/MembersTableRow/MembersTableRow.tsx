import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { api, UserForManagementItem } from '@/api'
import { Comissioner, Pencil } from '@/assets/icons'
import { Cross } from '@/assets/icons'
import { useUsersForManagement } from '@/helpers'

import { MembersEdit } from '../MembersEdit'

import styles from './MembersTableRow.module.scss'

export function MembersTableRow({
  userData,
}: {
  userData: UserForManagementItem
}) {
  const [isEdit, setIsEdit] = useState(false)

  const {
    query: { poolId },
  } = useRouter()

  const { usersForManagementMutate } = useUsersForManagement(Number(poolId))

  const joinedDate = userData.joined.split(' ')[0].split('-')

  async function deleteEntry(entryId: number) {
    await api.entries.delete(Number(poolId), entryId)
    usersForManagementMutate()
  }

  return (
    <>
      <tr
        className={classNames(styles.tr, {
          [styles.active]: isEdit,
        })}
      >
        <td>
          <div className={styles.nameWrapper}>
            <div
              className={classNames('short-name-block', styles.shortNameBlock)}
            >
              <p>
                {userData.first_name[0]}
                {userData.last_name[0]}
              </p>
            </div>
            <div className={styles.name}>
              <span>
                {userData.first_name} {userData.last_name}
              </span>
              {!!userData.commissioner && <Comissioner />}
              <div onClick={() => setIsEdit(!isEdit)}>
                <Pencil
                  className={classNames(styles.editIcon, {
                    [styles.active]: isEdit,
                  })}
                />
              </div>
            </div>
          </div>
        </td>
        <td>{userData.email}</td>
        <td>{`${joinedDate[2]}/${joinedDate[1]}/${joinedDate[0]}`}</td>
        <td>{userData.active ? 'Yes' : 'No'}</td>
        <td>
          <div className={styles.entries}>
            {userData.entries &&
              userData.entries.map((entry, i) => (
                <div className={styles.entry} key={i}>
                  {isEdit ? (
                    <span
                      className={styles.delete}
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Cross className={styles.deleteIcon} width={10} />
                    </span>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                  {entry.name}
                </div>
              ))}
          </div>
        </td>
        <td>
          <div className={styles.entries}>
            {userData.entries &&
              userData.entries.map((entry, i) => (
                <div key={i}>{entry.has_pick ? 'Yes' : 'No'}</div>
              ))}
          </div>
        </td>
      </tr>
      <MembersEdit userData={userData} isEdit={isEdit} />
    </>
  )
}
