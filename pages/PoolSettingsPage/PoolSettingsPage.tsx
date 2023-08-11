import classNames from 'classnames'
import getConfig from 'next/config'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment, useState } from 'react'

import { Pool } from '@/api'
import { CheckMark } from '@/assets/icons'
import { routes } from '@/config/constants'
import { usePool, useGetPoolSettingsInfo, useGetUser } from '@/helpers'

import styles from './PoolSettingsPage.module.scss'

export function PoolSettingsPage() {
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const {
    query: { poolId },
  } = useRouter()

  const { userData } = useGetUser()

  function copyToClipboard(data: string) {
    if (data) {
      navigator.clipboard.writeText(data).then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 1500)
        setIsVisible(true)
        setTimeout(() => setIsVisible(false), 900)
      })
    }
  }

  const { poolData } = usePool(Number(poolId))
  const { poolSettingsInfoData, poolSettingsInfoDataIsLoading } =
    useGetPoolSettingsInfo(Number(poolId))
  const { publicRuntimeConfig } = getConfig()

  function getCellInfo(type: string, data?: string | number) {
    switch (type) {
      case 'commissioner': {
        return (
          poolData?.owner && (
            <>
              {poolData.owner.first_name} {poolData.owner.last_name} (
              <Link href={`mailto:${poolData.owner.email}`} passHref>
                <span className={styles.link}>{poolData.owner.email}</span>
              </Link>
              )
            </>
          )
        )
      }
      case 'public_link_to_standings': {
        const attachUrl = `${publicRuntimeConfig.appUrl}/attach?pool_id=${poolData?.id}&password=${poolData?.password}`

        return (
          <div className={styles.copyLink}>
            <input
              className={styles.copyUrl}
              type="text"
              value={attachUrl}
              readOnly
              name="link"
            />
            <button
              className={classNames(styles.copyButton)}
              onClick={() => copyToClipboard(attachUrl)}
            >
              copy
              {isCopied && (
                <CheckMark
                  className={classNames(styles.icon, {
                    [styles.hide]: !isVisible,
                  })}
                />
              )}
            </button>
          </div>
        )
      }
      case 'questions': {
        return (
          <div>
            {(poolData as unknown as Pool<'qa'>)?.pick_pool
              ?.questions_with_points
              ? 'some data'
              : 'no data'}
          </div>
        )
      }
      case 'point_system': {
        return <div>{data ? 'some data' : 'no data'}</div>
      }
      case 'point_system_table': {
        return <div>{data ? 'some data' : 'no data'}</div>
      }
      case 'tournaments_list': {
        return <div>{data ? 'some data' : 'no data'}</div>
      }
      default: {
        return data
      }
    }
  }

  return (
    <div>
      <h1>POOL SETTINGS</h1>
      <div className={styles.wrapper}>
        {userData?.id === poolData?.owner.id && (
          <div className={styles.comi}>
            As the pool commissioner you can{' '}
            <Link
              href={routes.account.editPool(Number(poolId))}
              passHref
              className={styles.link}
            >
              edit these settings
            </Link>
          </div>
        )}

        <div className={styles.infoWrapper}>
          {!poolSettingsInfoDataIsLoading
            ? poolSettingsInfoData &&
              Object.entries(poolSettingsInfoData).map(
                ([groupTitle, rows], i) => (
                  <Fragment key={i}>
                    <h2>{groupTitle}</h2>
                    <div className={styles.infoTable}>
                      {!!rows.length &&
                        rows.map(({ title, type, data }, i) => (
                          <div className={styles.tableRow} key={i}>
                            <div>{title}</div>
                            <div>{getCellInfo(type, data)}</div>
                          </div>
                        ))}
                    </div>
                  </Fragment>
                ),
              )
            : 'Loading...'}
        </div>
      </div>
    </div>
  )
}
