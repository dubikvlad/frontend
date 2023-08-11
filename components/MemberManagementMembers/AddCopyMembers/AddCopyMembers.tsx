import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { Dispatch, SetStateAction, useState } from 'react'

import { PayPoolFee, PoolSettings } from '@/assets/icons'
import { CardWithButtonAndIcon } from '@/features/components'
import { Input, Checkbox } from '@/features/ui'

import styles from './AddCopyMembers.module.scss'

const AddMembersLazy = dynamic(
  () => import('../AddMembers').then((mod) => mod.AddMembers),
  {
    loading: () => <p>Loading...</p>,
  },
)

const CopyMembersLazy = dynamic(
  () => import('../CopyMembers').then((mod) => mod.CopyMembers),
  {
    loading: () => <p>Loading...</p>,
  },
)

export function AddCopyMembers({
  setShowAllMembers,
}: {
  setShowAllMembers: Dispatch<SetStateAction<boolean>>
}) {
  const [currentTab, setCurrentTab] = useState<
    'add-member' | 'copy-member' | null
  >(null)

  const [input, setInput] = useState('')
  const [hidePools, setHidePools] = useState(false)

  const tabsContent = [
    {
      title: 'Add a Member',
      desc: 'This form should only be used once your Pool join deadline has passed or for members who do not have access to the website. Otherwise, members should join themselves by using the "Join Existing Pool" link available from the homepage.',
      buttonText: 'Go to page',
      icon: PoolSettings,
      action: () => setCurrentTab('add-member'),
    },
    {
      title: 'Copy Members from another pool',
      desc: 'Select one of your other pools that you‘d like to copy members from. Members who already have an existing account in this pool with a matching email address will not be copied. Inactive members will not be copied. After copying your members, the new membership will automatically appear on their Memberships page when they login, however they will need to confirm their participation the first time they log in before they are considered a participating entry.',
      buttonText: 'Go to page',
      icon: PayPoolFee,
      action: () => setCurrentTab('copy-member'),
    },
  ]
  return (
    <>
      <div className={styles.head}>
        <div className={styles.filters}>
          {currentTab === 'copy-member' && (
            <>
              <Input
                value={input}
                onChange={setInput}
                type="search"
                placeholder="Search"
              />

              <Checkbox value={hidePools} onChange={setHidePools}>
                Hide pools with null
              </Checkbox>
            </>
          )}
        </div>
        <div className={styles.buttons}>
          {currentTab === null && (
            <button
              className={classNames(
                'button button-blue-outline',
                styles.button,
                styles.buttonBig,
              )}
              onClick={() => setShowAllMembers((prev) => !prev)}
            >
              All Members
            </button>
          )}
          {currentTab === 'add-member' && (
            <button
              className={classNames(
                'button button-blue-outline',
                styles.button,
                styles.buttonBig,
              )}
              onClick={() => setCurrentTab('copy-member')}
            >
              Copy Members
            </button>
          )}
          {currentTab === 'copy-member' && (
            <button
              className={classNames(
                'button button-blue-outline',
                styles.button,
                styles.buttonBig,
              )}
              onClick={() => setCurrentTab('add-member')}
            >
              Add Member
            </button>
          )}
        </div>
      </div>
      <div
        className={classNames(styles.wrapper, {
          [styles.active]: currentTab !== null,
        })}
      >
        {currentTab === null &&
          tabsContent.map((item, i) => (
            <CardWithButtonAndIcon props={item} key={i} />
          ))}

        {currentTab === 'add-member' && (
          <AddMembersLazy setShowAllMembers={setShowAllMembers} />
        )}
        {currentTab === 'copy-member' && (
          <CopyMembersLazy search={input} hidePools={hidePools} />
        )}
      </div>
    </>
  )
}
