import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { Dispatch, SetStateAction, useState } from 'react'

import { AddMember } from '@/assets/icons'

const AddAccountForMemberLazy = dynamic(
  () => import('../AddAccountForMember').then((mod) => mod.AddAccountForMember),
  {
    loading: () => <p>Loading...</p>,
  },
)

const UserHasAccountLazy = dynamic(
  () => import('../UserHasAccount').then((mod) => mod.UserHasAccount),
  {
    loading: () => <p>Loading...</p>,
  },
)

import styles from './AddMembers.module.scss'

type Tabs = 'create' | 'has_account'

export function AddMembers({
  setShowAllMembers,
}: {
  setShowAllMembers: Dispatch<SetStateAction<boolean>>
}) {
  const [currentTab, setCurrentTab] = useState<Tabs>('create')

  return (
    <div className={styles.wrapper}>
      <div className={styles.info}>
        <div className={styles.titleWrapper}>
          <AddMember />
          <h3 className={styles.title}>Add a Member</h3>
        </div>
        <p className={styles.infoText}>
          This form should only be used once your Pool join deadline has passed
          or for members who do not have access to the website. Otherwise,
          members should join themselves by using the &apos;Join Existing
          Pool&apos; link available from the homepage.
        </p>
      </div>
      <div className={styles.content}>
        <div className={styles.tabs}>
          <div
            className={classNames(styles.tab, {
              [styles.active]: currentTab === 'create',
            })}
            onClick={() => setCurrentTab('create')}
          >
            Create an account for new user
          </div>
          <div
            className={classNames(styles.tab, {
              [styles.active]: currentTab === 'has_account',
            })}
            onClick={() => setCurrentTab('has_account')}
          >
            User already has an account
          </div>
        </div>
        {currentTab === 'create' && (
          <AddAccountForMemberLazy setShowAllMembers={setShowAllMembers} />
        )}
        {currentTab === 'has_account' && <UserHasAccountLazy />}
      </div>
    </div>
  )
}
