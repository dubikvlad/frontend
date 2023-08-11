import classNames from 'classnames'
import getConfig from 'next/config'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { MemberManagement, EmailMembers, CheckMark } from '@/assets/icons'
import { routes } from '@/config/constants'
import { CardWithButtonAndIcon } from '@/features/components'
import { Input } from '@/features/ui'
import { usePool } from '@/helpers'

import styles from './PoolMembersManagement.module.scss'

const EmailMembersLazy = dynamic(
  () =>
    import('@/features/components/EmailMembers').then(
      (mod) => mod.EmailMembers,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

export default function PoolMembersManagement() {
  const {
    query: { poolId },
  } = useRouter()

  const [activeTab, setActiveTab] = useState<'email-members' | null>(null)

  const tabsContent = [
    {
      title: 'Member Management',
      desc: `This page shows all of your members, along with their chosen entry count for this year. Members from previous years who have not yet returned will be listed as Participation TBD. You can edit members individually by clicking on their row, or edit multiple members at a time by clicking the 'Edit Mode' button at the top.`,
      buttonText: 'Go to page',
      link: routes.account.commish.memberManagement(Number(poolId)),
      icon: MemberManagement,
    },
    {
      title: 'Email Members',
      desc: `Generate a list of email addresses you can use to send an email.`,
      buttonText: 'Go to page',
      link: null,
      icon: EmailMembers,
      action: () => setActiveTab('email-members'),
    },
  ]

  const [isVisible, setIsVisible] = useState<boolean>(false)

  const { poolData } = usePool(Number(poolId))
  const { publicRuntimeConfig } = getConfig()

  const attachUrl = `${publicRuntimeConfig.appUrl}/attach?pool_id=${poolData?.id}&password=${poolData?.password}`

  function copyToClipboard(data: string) {
    if (data) {
      navigator.clipboard.writeText(data).then(() => {
        setIsVisible(true)
        setTimeout(() => setIsVisible(false), 1500)
      })
    }
  }

  return (
    <div className={styles.wrapper}>
      {activeTab === null && (
        <>
          <div className={styles.invite}>
            <h3 className={styles.title}>Invite New Members</h3>
            <p className={styles.intro}>
              The following link is for NEW members only to join your pool. Do
              NOT send it to existing members. Copy the link then paste it into
              an email, social media site, or any other destination:
            </p>
            <div className={styles.inputWrapper}>
              <Input
                value={attachUrl}
                placeholder="Join Link"
                withLabel
                onChange={() => ''}
                readOnly
              />

              <button
                className={classNames(
                  'button button-blue-light',
                  styles.button,
                )}
                onClick={() => copyToClipboard(attachUrl)}
              >
                <span
                  className={classNames({
                    [styles.isVisible]: !isVisible,
                  })}
                >
                  copy
                </span>
                <span
                  className={classNames({
                    [styles.isVisible]: isVisible,
                  })}
                >
                  copied <CheckMark />
                </span>
              </button>
            </div>
          </div>
          <div className={styles.wrapperTabs}>
            {tabsContent.map((item, i) => (
              <CardWithButtonAndIcon props={item} key={i} />
            ))}
          </div>
        </>
      )}

      <div>{activeTab === 'email-members' && <EmailMembersLazy />}</div>
    </div>
  )
}
