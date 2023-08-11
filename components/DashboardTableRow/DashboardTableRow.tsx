import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import type { PoolData, UserResponseData } from '@/api'
import { api, EditPool } from '@/api'
import {
  Archive,
  ArchiveRestore,
  ChangeCircle,
  CheckMark,
  Comissioner,
  DeleteForever,
  Details,
  Members,
  MonthRightArrow,
  VerticalDots,
} from '@/assets/icons'
import { leaguesByPoolTypeById, routes } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { USER_MODAL_TYPES } from '@/features/modals'
import { DashboardPageTabs } from '@/features/pages/DashboardPage'
import { stringifyMonth, useAuth, useCopyToClipboard } from '@/helpers'

import styles from './DashboardTableRow.module.scss'

export function DashboardTableRow({
  pool,
  poolsMutate,
  activeTab,
  breakpoint,
}: {
  pool: PoolData
  poolsMutate: () => void
  activeTab: DashboardPageTabs
  breakpoint: 'sm' | 'md' | 'source' | null
}) {
  const { userData } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const [showConfirmDeletion, setShowConfirmDeletion] = useState(false)
  const [isFocus, setIsFocus] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>(pool.name)

  useEffect(() => {
    setInputValue(pool.name)
  }, [pool])

  function returnDate(data: Date) {
    const date = new Date(data)

    return `${stringifyMonth({
      month: date.getMonth(),
    })} ${date.getDate()}, ${date.getFullYear()}`
  }

  async function handleArchive(poolId: number, is_archive: boolean) {
    const arr = []
    userData && (arr[userData?.id] = { is_archive: is_archive ? 1 : 0 })

    api.pools.editUsers(Number(poolId), arr)
    poolsMutate()
  }

  async function sendJoinRequest(poolId: number) {
    await api.pools.requestToJoin(Number(poolId))
    poolsMutate()
  }

  async function rename() {
    setIsFocus(false)

    const data: EditPool[] = [{ key: 'name', value: inputValue }]

    if (pool.name.trim() !== inputValue.trim()) {
      api.pools.edit(Number(pool.id), data)
      poolsMutate()
    }
  }

  useEffect(() => {
    setShowConfirmDeletion(false)
  }, [dropdownIsOpen])

  useEffect(() => {
    if (isFocus && inputRef.current) inputRef.current.focus()
  }, [isFocus])

  if (breakpoint === 'sm') {
    return (
      <div className={styles.rowSm}>
        <div className={styles.top}>
          <div className={styles.left}>
            <div className={styles.imgWrap}>
              {leaguesByPoolTypeById[pool.pool_type.tournament_id] && (
                <Image
                  src={leaguesByPoolTypeById[pool.pool_type.tournament_id].src}
                  alt={pool.pool_type.title}
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: '100%', height: 'auto' }}
                />
              )}
            </div>
            <div className={styles.poolName}>
              <div className={styles.poolNameInfo}>
                {isFocus ? (
                  <input
                    ref={inputRef}
                    className={classNames(styles.entryRenameInput)}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={rename}
                    onKeyDown={(e) =>
                      (e.key === 'Enter' && rename()) ||
                      (e.key === 'Escape' &&
                        (() => {
                          setInputValue(pool.name)
                          setIsFocus(false)
                        })())
                    }
                  />
                ) : (
                  <p>
                    {userData?.id == pool.owner.id && (
                      <span>
                        <Comissioner className={styles.icon} />
                      </span>
                    )}
                    {inputValue}
                  </p>
                )}

                <span
                  className={classNames({
                    [styles.focusedName]: isFocus,
                  })}
                >
                  {pool.pool_type.title}
                </span>

                <p className={styles.ownerName}>
                  Commissioner: {pool.owner.username}
                </p>
              </div>
            </div>
          </div>

          <Settings
            breakpoint={breakpoint}
            dropdownIsOpen={dropdownIsOpen}
            setDropdownIsOpen={setDropdownIsOpen}
            activeTab={activeTab}
            showConfirmDeletion={showConfirmDeletion}
            setShowConfirmDeletion={setShowConfirmDeletion}
            poolsMutate={poolsMutate}
            setIsFocus={setIsFocus}
            handleArchive={handleArchive}
            pool={pool}
            userData={userData}
          />
        </div>

        <div className={styles.bottom}>
          <div className={styles.entries}>
            <p className={styles.title}>Entries:</p>
            <div>
              <Members className={styles.entriesIcon} />

              <p
                dangerouslySetInnerHTML={{
                  __html:
                    pool.pool_type.type !== 'squares' &&
                    pool.pool_type.type !== 'golf_squares'
                      ? `${pool.entries_count}/${
                          pool.max_entries ?? '&#8734;'
                        } spots`
                      : '',
                }}
              />
            </div>
          </div>

          <div className={styles.startDate}>
            <p className={styles.title}>Start date:</p>
            <p>{returnDate(pool.created_at)}</p>
          </div>
        </div>

        {activeTab === 'join a pool' ? (
          <div className={styles.bottomActions}>
            {pool?.waiting ? (
              <button
                disabled
                className={classNames('button button-orange', styles.button)}
              >
                Pending
              </button>
            ) : (
              <button
                onClick={() => sendJoinRequest(pool.id)}
                className={classNames(
                  'button button-blue-light',
                  styles.button,
                )}
              >
                Join
              </button>
            )}
          </div>
        ) : (
          <></>
        )}

        {activeTab === 'archived' ? (
          <div className={styles.bottomActions}>
            <button
              className={classNames('button button-blue-light', styles.button)}
              onClick={() => {
                handleArchive(pool.id, false)
              }}
            >
              Restart
            </button>
          </div>
        ) : (
          <></>
        )}

        {activeTab === 'my pools' && (
          <Link
            href={routes.account.overview(pool.id)}
            passHref
            className={styles.link}
          />
        )}
      </div>
    )
  }

  return (
    <div
      className={classNames(styles.tableRow, {
        [styles.anotherGrid]: ['archived', 'join a pool'].includes(activeTab),
      })}
    >
      <div className={styles.name}>
        <div>
          {leaguesByPoolTypeById[pool.pool_type.tournament_id] && (
            <Image
              src={leaguesByPoolTypeById[pool.pool_type.tournament_id].src}
              alt={pool.pool_type.title}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </div>
        <div className={styles.poolName}>
          <div className={styles.poolNameInfo}>
            {isFocus ? (
              <input
                ref={inputRef}
                className={classNames(styles.entryRenameInput)}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={rename}
                onKeyDown={(e) =>
                  (e.key === 'Enter' && rename()) ||
                  (e.key === 'Escape' &&
                    (() => {
                      setInputValue(pool.name)
                      setIsFocus(false)
                    })())
                }
              />
            ) : (
              <p>
                {userData?.id == pool.owner.id && (
                  <span>
                    <Comissioner className={styles.icon} />
                  </span>
                )}
                {inputValue}
              </p>
            )}

            <span
              className={classNames({
                [styles.focusedName]: isFocus,
              })}
            >
              {pool.pool_type.title}
            </span>
          </div>
        </div>
      </div>
      <div
        className={classNames(styles.text, styles.membersText)}
        dangerouslySetInnerHTML={{
          __html:
            pool.pool_type.type !== 'squares' &&
            pool.pool_type.type !== 'golf_squares'
              ? `${pool.entries_count}/${pool.max_entries ?? '&#8734;'} spots`
              : '',
        }}
      />
      <div className={styles.text}>{returnDate(pool.created_at)}</div>
      <div className={styles.text}>{pool.owner.username}</div>

      <div className={styles.endText}>
        {activeTab === 'join a pool' &&
          (pool?.waiting ? (
            <button
              disabled
              className={classNames('button button-orange', styles.button)}
            >
              Pending
            </button>
          ) : (
            <button
              onClick={() => sendJoinRequest(pool.id)}
              className={classNames('button button-blue-light', styles.button)}
            >
              Join
            </button>
          ))}

        {activeTab === 'archived' && (
          <button
            className={classNames('button button-blue-light', styles.button)}
            onClick={() => {
              handleArchive(pool.id, false)
            }}
          >
            Restart
          </button>
        )}

        <Settings
          breakpoint={breakpoint}
          dropdownIsOpen={dropdownIsOpen}
          setDropdownIsOpen={setDropdownIsOpen}
          activeTab={activeTab}
          showConfirmDeletion={showConfirmDeletion}
          setShowConfirmDeletion={setShowConfirmDeletion}
          poolsMutate={poolsMutate}
          setIsFocus={setIsFocus}
          handleArchive={handleArchive}
          pool={pool}
          userData={userData}
        />
      </div>

      {activeTab === 'my pools' && (
        <Link
          href={routes.account.overview(pool.id)}
          passHref
          className={styles.link}
        />
      )}
    </div>
  )
}

function Settings({
  breakpoint,
  pool,
  activeTab,
  dropdownIsOpen,
  setDropdownIsOpen,
  showConfirmDeletion,
  setShowConfirmDeletion,
  handleArchive,
  poolsMutate,
  userData,
  setIsFocus,
}: {
  breakpoint: 'sm' | 'md' | 'source' | null
  pool: PoolData
  activeTab: DashboardPageTabs
  setDropdownIsOpen: Dispatch<SetStateAction<boolean>>
  dropdownIsOpen: boolean
  showConfirmDeletion: boolean
  setShowConfirmDeletion: Dispatch<SetStateAction<boolean>>
  handleArchive: (poolId: number, is_archive: boolean) => void
  poolsMutate: () => void
  userData: UserResponseData | undefined
  setIsFocus: Dispatch<SetStateAction<boolean>>
}) {
  const { copyToClipboard, copiedToClipboard, showCheck } = useCopyToClipboard()
  const { openModal } = useOpenModal()

  function openMembershipDetailsModal() {
    console.log('Click')
    openModal({
      type: USER_MODAL_TYPES.DASHBOARD_MEMBERSHIP_DETAILS,
      props: { pool: pool },
    })
  }

  async function deletePool(poolId: number) {
    if (isAdmin) await api.pools.delete(Number(poolId))
    else
      await api.pools.deleteNotComissioner(Number(poolId), Number(userData?.id))

    poolsMutate()
  }

  const isAdmin = userData?.id === pool.owner.id

  return (
    <>
      {['my pools', 'archived'].includes(activeTab) ? (
        <div className={classNames(styles.dots, styles.entrySettings)}>
          <OutsideClickHandler
            onOutsideClick={() => setDropdownIsOpen(false)}
            display="contents"
          >
            <div
              onClick={() => {
                setDropdownIsOpen((prev) => !prev)
              }}
              className={styles.dotsWrapper}
            >
              <VerticalDots className={styles.dots} />
            </div>
            <div
              className={classNames(styles.entrySettingsList, {
                [styles.entrySettingsListIsOpen]: dropdownIsOpen,
                [styles.confirmDeletion]: showConfirmDeletion,
              })}
            >
              {activeTab === 'my pools' && (
                <>
                  <div
                    className={classNames(
                      styles.entrySettingsListItem,
                      styles.entrySettingsListDetails,
                    )}
                    onClick={() =>
                      breakpoint && ['md', 'sm'].includes(breakpoint)
                        ? openMembershipDetailsModal()
                        : null
                    }
                  >
                    <Details />
                    <p>
                      Membership Details
                      <span>
                        <MonthRightArrow className={styles.arrow} />
                      </span>
                    </p>

                    <div className={styles.entrySettingsDetails}>
                      <div className={styles.detailsData}>
                        <div className={styles.detailsTitle}>
                          Membership Details
                        </div>
                        <div className={styles.detailsInfo}>
                          <p>Membership ID:</p>
                          <p>{pool.membership_id}</p>
                        </div>
                        <div className={styles.detailsInfo}>
                          <p>Join Date:</p>
                          <p>
                            {new Date(pool.join_date)
                              .toLocaleDateString()
                              .split('.')
                              .join('/')}
                          </p>
                        </div>
                        <div className={styles.detailsInfo}>
                          <p>Pool ID:</p>
                          <p>{pool.id}</p>
                        </div>
                      </div>
                      <div className={styles.detailsData}>
                        <div className={styles.detailsInfo}>
                          <p>Pool Commissioner:</p>
                          <p>
                            {pool.owner?.first_name} {pool.owner?.last_name}
                          </p>
                        </div>
                        <div className={styles.detailsInfoWrapper}>
                          <div className={styles.detailsInfo}>
                            <p>Commissioner Email:</p>
                            <p>{pool.owner?.email}</p>
                          </div>
                          <div
                            className={styles.detailsCopy}
                            onClick={() => copyToClipboard(pool.owner.email)}
                          >
                            copy
                            {copiedToClipboard && (
                              <CheckMark
                                className={classNames({
                                  [styles.hide]: !showCheck,
                                })}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div
                      className={styles.entrySettingsListItem}
                      onClick={() => {
                        setDropdownIsOpen(false)
                        setIsFocus(true)
                      }}
                    >
                      <ChangeCircle className={styles.entryChangeCircle} />
                      <p>Rename Pool</p>
                    </div>
                  )}
                </>
              )}
              <div
                className={styles.entrySettingsListItem}
                onClick={() => {
                  setDropdownIsOpen(false)
                  handleArchive(pool.id, activeTab === 'my pools')
                }}
              >
                {activeTab === 'my pools' ? (
                  <>
                    <Archive className={styles.entryChangeArchive} />
                    <p>Archive</p>
                  </>
                ) : (
                  <>
                    <ArchiveRestore className={styles.entryChangeArchive} />
                    <p>Unarchive</p>
                  </>
                )}
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
                    ? `Do you want to delete ${
                        isAdmin ? 'the pool' : 'all entries'
                      } ?`
                    : `Delete ${isAdmin ? 'Pool' : 'entries'}`}
                </p>
              </div>

              {showConfirmDeletion && (
                <p
                  className={styles.deleteText}
                  onClick={() => {
                    deletePool(pool.id)
                    setDropdownIsOpen(false)
                  }}
                >
                  <span>Delete</span>
                </p>
              )}
            </div>
          </OutsideClickHandler>
        </div>
      ) : (
        <></>
      )}
    </>
  )
}
