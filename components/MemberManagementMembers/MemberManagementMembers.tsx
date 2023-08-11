import { useRouter } from 'next/router'
import { useState } from 'react'

import { useUsersForManagement } from '@/helpers'

import { AddCopyMembers } from './AddCopyMembers'
import styles from './MemberManagementMembers.module.scss'
import { MembersTable } from './MembersTable'

export function MemberManagementMembers() {
  const [showAllMembers, setShowAllMembers] = useState(true)

  const {
    query: { poolId },
  } = useRouter()

  const { usersForManagementData } = useUsersForManagement(Number(poolId))

  return (
    <div className={styles.wrapper}>
      {showAllMembers ? (
        <MembersTable
          data={usersForManagementData}
          setShowAllMembers={setShowAllMembers}
        />
      ) : (
        <AddCopyMembers setShowAllMembers={setShowAllMembers} />
      )}
    </div>
  )
}
