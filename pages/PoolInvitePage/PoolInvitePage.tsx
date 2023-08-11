import classNames from 'classnames'
import getConfig from 'next/config'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Dispatch,
  SetStateAction,
  memo,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'

import { UsersResponseData, UserResponseData, api } from '@/api'
import {
  CheckMark,
  Cross,
  MonthLeftArrow,
  MonthRightArrow,
} from '@/assets/icons'
import {
  emailRegexp,
  getShortName,
  rf,
  routes,
  scrollToElement,
  writeErrorToState,
} from '@/config/constants'
import {
  StartNewPoolDescription,
  StartNewPoolDescriptionBlock,
} from '@/features/components'
import { Input, RHFInput } from '@/features/ui'
import {
  useDebounce,
  useGetPoolType,
  usePool,
  useGetInvitingUsers,
  useMessage,
  useAdaptiveBreakpoints,
} from '@/helpers'

import styles from './PoolInvitePage.module.scss'

const { publicRuntimeConfig } = getConfig()
const appUrl = publicRuntimeConfig.appUrl

type SelectedMember = {
  email: string
  name: string
  userId: number
  removed: boolean
}

type AddedEmail = Pick<SelectedMember, 'email' | 'name' | 'removed'>

const checkEmail = (email: string) => emailRegexp.test(email)

export function PoolInvitePage() {
  const {
    query: { poolTypeId, poolId },
    push,
  } = useRouter()

  const { isBreakpointPassed } = useAdaptiveBreakpoints(['md', 'sm'])

  const isMdBreakpointPassed = isBreakpointPassed('md')
  const isSmBreakpointPassed = isBreakpointPassed('sm')

  const { poolTypeData } = useGetPoolType(Number(poolTypeId))
  const { poolData } = usePool(Number(poolId))

  const [inviteLink, setInviteLink] = useState('')

  useEffect(() => {
    if (poolData && !inviteLink.trim()) {
      setInviteLink(
        `${appUrl}/attach?pool_id=${poolData.id}&password=${poolData.password}`,
      )
    }
  }, [poolData, inviteLink])

  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([])
  const [addedEmails, setAddedEmails] = useState<AddedEmail[]>([])

  const skipForNowLink = poolData
    ? poolData.type === 'squares' || poolData.type === 'golf_squares'
      ? routes.account.grid.gettingStarted(poolData.id)
      : routes.account.overview(poolData.id)
    : null

  const [isShowSelectedEmails, setIsShowSelectedEmails] = useState(false)

  const [isLoadind, setIsLoading] = useState(false)
  const [error, setError] = useMessage()

  const alertRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToElement(alertRef, 40)
  }, [error])

  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsCopied(false), 500)
    return () => clearTimeout(timer)
  }, [isCopied])

  type MemberInvitedTabType = 'via_member' | 'via_email'

  const [memberInvitedTab, setMemberInvitedTab] =
    useState<MemberInvitedTabType>('via_member')

  useEffect(() => {
    if (isSmBreakpointPassed) {
      setIsShowSelectedEmails(false)
      setMemberInvitedTab('via_member')
    }
  }, [isSmBreakpointPassed])

  if (!poolTypeData) return null

  const copyText = () => {
    navigator.clipboard.writeText(inviteLink)
    setIsCopied(true)
  }

  const sendData = async () => {
    if (!poolData) return

    try {
      setIsLoading(true)

      const existsUsers = selectedMembers
        .filter((item) => !item.removed)
        .reduce<number[]>((acc, item) => {
          acc.push(item.userId)
          return acc
        }, [])

      const notExistsUsers = addedEmails
        .filter((item) => !item.removed)
        .reduce<{ email: string; name: string }[]>((acc, item) => {
          acc.push({
            email: item.email,
            name: item.name.trim() || item.email,
          })
          return acc
        }, [])

      if (!existsUsers.length && !notExistsUsers.length) {
        setIsLoading(false)
        return
      }

      const res = await api.pools.inviteUsers(Number(poolId), {
        exists_users: existsUsers,
        emails: notExistsUsers,
      })

      if (res.error) {
        writeErrorToState(res.error, setError)
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      if (skipForNowLink) push(skipForNowLink)
    } catch (err) {
      writeErrorToState(err, setError)
      setIsLoading(false)
    }
  }

  function deleteUninvitedEmails() {
    function deteleEmails<
      TState extends SelectedMember | AddedEmail = SelectedMember,
    >(state: TState[], setState: Dispatch<SetStateAction<TState[]>>) {
      const editedState = state.reduce<TState[]>((acc, item) => {
        if (item.removed) return acc
        acc.push(item)
        return acc
      }, [])

      setState(editedState)
    }

    deteleEmails(selectedMembers, setSelectedMembers)
    deteleEmails(addedEmails, setAddedEmails)
  }

  function removeOrInviteAllSelectedEmails(action: 'remove' | 'invite') {
    function toggle<
      TState extends SelectedMember | AddedEmail = SelectedMember,
    >(state: TState[], setState: Dispatch<SetStateAction<TState[]>>) {
      const editedState = state.reduce<TState[]>((acc, item) => {
        acc.push({ ...item, removed: action === 'remove' })
        return acc
      }, [])

      setState(editedState)
    }

    toggle(selectedMembers, setSelectedMembers)
    toggle(addedEmails, setAddedEmails)
  }

  const selectedEmailsRemovedCount =
    selectedMembers.reduce(
      (count, item) => (item.removed ? ++count : count),
      0,
    ) + addedEmails.reduce((count, item) => (item.removed ? ++count : count), 0)

  const selectedEmailsInvited =
    selectedMembers.length + addedEmails.length - selectedEmailsRemovedCount

  const isSelectedEmailsRemovedAll =
    selectedEmailsRemovedCount === selectedMembers.length + addedEmails.length

  return (
    <div className={styles.wrapper}>
      <StartNewPoolDescription activeStep={3} />

      <div className={styles.poolInviteWrapper}>
        <StartNewPoolDescriptionBlock
          title={poolTypeData.title}
          description={poolTypeData.description}
          tournamentExternalId={poolTypeData.tournament.external_id}
        />

        <div>
          <div className={styles.poolInviteBlock}>
            <div className={styles.poolInviteTitleWrapper}>
              <div>
                <p className={styles.poolInviteTitle}>Invite pool members</p>
                <p className={styles.advice}>
                  Invite at least 7 members to make sure your pool stays fun.
                  Invite connections below or using this link
                </p>
              </div>

              {isMdBreakpointPassed && (
                <button className="button button-blue-light" onClick={copyText}>
                  {isCopied ? (
                    <>
                      Copied <CheckMark />
                    </>
                  ) : (
                    'Copy invite link'
                  )}
                </button>
              )}

              {!!skipForNowLink && (
                <Link href={skipForNowLink} className={styles.skipForNowText}>
                  Skip {isMdBreakpointPassed && 'inviting '}for now
                </Link>
              )}
            </div>

            <div className={styles.form}>
              {!!error && (
                <div ref={alertRef} className="alert alert-danger">
                  {error}
                </div>
              )}

              {!isMdBreakpointPassed && (
                <div className={styles.inviteLinkWrapper}>
                  <Input
                    withLabel
                    placeholder="Invite Link"
                    readOnly
                    className={styles.inviteLinkInputWrapper}
                    inputClassName={styles.inviteLinkInput}
                    value={inviteLink}
                    onChange={setInviteLink}
                  />

                  <button
                    className={classNames(
                      'button',
                      'button-blue-light',
                      'uppercase',
                      styles.copyButton,
                    )}
                    onClick={copyText}
                  >
                    {isCopied ? (
                      <>
                        Copied <CheckMark />
                      </>
                    ) : (
                      'Copy invite link'
                    )}
                  </button>
                </div>
              )}

              {isSmBreakpointPassed && (
                <div className={styles.memberInvitedTabsWrapper}>
                  <p
                    className={classNames(styles.memberInvitedTabText, {
                      [styles.memberInvitedTabTextActive]:
                        memberInvitedTab === 'via_member',
                    })}
                    onClick={() => setMemberInvitedTab('via_member')}
                  >
                    Via Member
                  </p>
                  <p
                    className={classNames(styles.memberInvitedTabText, {
                      [styles.memberInvitedTabTextActive]:
                        memberInvitedTab === 'via_email',
                    })}
                    onClick={() => setMemberInvitedTab('via_email')}
                  >
                    Via Email
                  </p>
                </div>
              )}

              {isShowSelectedEmails ? (
                <div className={styles.selectedEmailsListWrapper}>
                  <div
                    className={styles.numberSelectedEmailsAndRemoveAllWrapper}
                  >
                    <p className={styles.numberSelectedEmailsText}>
                      {selectedEmailsInvited} / ∞
                    </p>
                    <p
                      className={styles.removeOrInviteAllText}
                      onClick={() =>
                        removeOrInviteAllSelectedEmails(
                          isSelectedEmailsRemovedAll ? 'invite' : 'remove',
                        )
                      }
                    >
                      {isSelectedEmailsRemovedAll ? 'Invite All' : 'Remove All'}
                    </p>
                  </div>

                  <InviteListMemoized
                    selectedMembers={selectedMembers}
                    setSelectedMembers={setSelectedMembers}
                    isShowSelectedEmails={isShowSelectedEmails}
                    addedEmails={addedEmails}
                    setAddedEmails={setAddedEmails}
                  />
                </div>
              ) : (
                <div className={styles.emailsFormWrapper}>
                  {isSmBreakpointPassed ? (
                    <div className={styles.formItem}>
                      {memberInvitedTab === 'via_member' ? (
                        <MembersFormWrapper
                          selectedMembers={selectedMembers}
                          setSelectedMembers={setSelectedMembers}
                          isShowSelectedEmails={isShowSelectedEmails}
                          isSmBreakpointPassed={isSmBreakpointPassed}
                          selectedEmailsInvited={selectedEmailsInvited}
                        />
                      ) : (
                        <EmailsFormWrapper
                          addedEmails={addedEmails}
                          setAddedEmails={setAddedEmails}
                          isMdBreakpointPassed={isMdBreakpointPassed}
                          isSmBreakpointPassed={isSmBreakpointPassed}
                          selectedEmailsInvited={selectedEmailsInvited}
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      <div className={styles.formItem}>
                        <MembersFormWrapper
                          selectedMembers={selectedMembers}
                          setSelectedMembers={setSelectedMembers}
                          isShowSelectedEmails={isShowSelectedEmails}
                          isSmBreakpointPassed={isSmBreakpointPassed}
                          selectedEmailsInvited={selectedEmailsInvited}
                        />
                      </div>

                      <div className={styles.formItem}>
                        <EmailsFormWrapper
                          addedEmails={addedEmails}
                          setAddedEmails={setAddedEmails}
                          isMdBreakpointPassed={isMdBreakpointPassed}
                          isSmBreakpointPassed={isSmBreakpointPassed}
                          selectedEmailsInvited={selectedEmailsInvited}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {(selectedMembers.length !== 0 || addedEmails.length !== 0) && (
            <div className={styles.buttonsWrapper}>
              <button
                className="button button-black uppercase"
                onClick={() => {
                  if (isShowSelectedEmails) {
                    deleteUninvitedEmails()
                    setIsShowSelectedEmails(false)
                  } else {
                    setIsShowSelectedEmails(true)
                  }
                }}
              >
                {isSelectedEmailsRemovedAll ? (
                  <>
                    <MonthLeftArrow className={styles.monthLeftArrow} /> No one
                    is selected
                  </>
                ) : (
                  <>{selectedEmailsInvited} Selected</>
                )}
              </button>

              <button
                className={classNames('button uppercase', {
                  'button-white': !isMdBreakpointPassed,
                  'button-blue-light': isMdBreakpointPassed,
                  disabled: isSelectedEmailsRemovedAll || isLoadind,
                })}
                onClick={() =>
                  !isSelectedEmailsRemovedAll && !isLoadind && sendData()
                }
              >
                Invite {selectedEmailsInvited} Persons
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type MembersFormWrapperProps = {
  selectedMembers: SelectedMember[]
  setSelectedMembers: Dispatch<
    SetStateAction<MembersFormWrapperProps['selectedMembers']>
  >
  isShowSelectedEmails: boolean
  isSmBreakpointPassed: boolean
  selectedEmailsInvited: number
}

function MembersFormWrapper({
  selectedMembers,
  setSelectedMembers,
  isShowSelectedEmails,
  isSmBreakpointPassed,
  selectedEmailsInvited,
}: MembersFormWrapperProps) {
  const [memberName, setMemberName] = useState<string>('')

  const debouncedSearchTerm = useDebounce(memberName)

  const { invitingUsersData } = useGetInvitingUsers(debouncedSearchTerm)

  return (
    <>
      <Input
        value={memberName}
        onChange={setMemberName}
        withLabel
        placeholder="Enter Member Name"
      />

      {isSmBreakpointPassed && !!invitingUsersData?.length && (
        <p className={styles.mobileNumberSelectedEmailsText}>
          {selectedEmailsInvited} / ∞
        </p>
      )}

      <InviteListMemoized
        membersInfo={invitingUsersData}
        selectedMembers={selectedMembers}
        setSelectedMembers={setSelectedMembers}
        isShowSelectedEmails={isShowSelectedEmails}
      />
    </>
  )
}

type EmailsFormWrapperProps = {
  addedEmails: AddedEmail[]
  setAddedEmails: Dispatch<
    SetStateAction<EmailsFormWrapperProps['addedEmails']>
  >
  isMdBreakpointPassed: boolean
  isSmBreakpointPassed: boolean
  selectedEmailsInvited: number
}

type EmailFormValues = { email: string }

function EmailsFormWrapper({
  addedEmails,
  setAddedEmails,
  isMdBreakpointPassed,
  isSmBreakpointPassed,
  selectedEmailsInvited,
}: EmailsFormWrapperProps) {
  const { control, watch, setValue, setError, clearErrors } =
    useForm<EmailFormValues>({ defaultValues: { email: '' } })

  const watchedEmail = watch('email')

  useEffect(() => {
    if (watchedEmail.includes(',')) {
      const email = watchedEmail.split(',')[0]

      if (!checkEmail(email)) {
        setError('email', { message: rf.pleaseEnterCorrectEmail })
        setTimeout(() => clearErrors('email'), 3000)
      } else {
        if (
          !!email &&
          !addedEmails.find((item) => item.email === email) &&
          !!setAddedEmails
        ) {
          setAddedEmails((prev) => [
            ...prev,
            { email, name: '', removed: false },
          ])
        }
      }

      setValue('email', '')
    }
  }, [
    addedEmails,
    setAddedEmails,
    watchedEmail,
    setValue,
    clearErrors,
    setError,
  ])

  const addEmail = () => {
    if (checkEmail(watchedEmail)) {
      if (
        !!watchedEmail &&
        !addedEmails.find((item) => item.email === watchedEmail)
      ) {
        setAddedEmails((prev) => [
          ...prev,
          { email: watchedEmail, name: '', removed: false },
        ])
      }

      setValue('email', '')
    } else {
      setError('email', { message: rf.pleaseEnterCorrectEmail })
      setTimeout(() => clearErrors('email'), 3000)
    }
  }

  const deleteEmail = (value: string) => {
    const arr = [...addedEmails]
    arr.splice(
      arr.findIndex((addedEmail) => addedEmail.email === value),
      1,
    )
    setAddedEmails(arr)
  }

  return (
    <>
      <div className={styles.emailsInputWrapper}>
        <RHFInput
          control={control}
          name="email"
          withLabel
          placeholder={
            isMdBreakpointPassed
              ? 'Enter emails separated by comma or click the button'
              : 'Enter emails here separated by comma or Enter button'
          }
          validationType="withoutSpaces"
          onKeyDown={(e) => String(e.key) === 'Enter' && addEmail()}
          className={styles.emailsInput}
          inputWrapper2ClassName={styles.emailsInputWrapper2}
        />

        <button
          className={classNames(
            'button button-blue-light',
            styles.rightArrowButton,
            {
              disabled: !watchedEmail.trim(),
              [styles.rightArrowButtonHide]: !isMdBreakpointPassed,
            },
          )}
          onClick={addEmail}
        >
          <MonthRightArrow />
        </button>
      </div>

      {isSmBreakpointPassed && !!addedEmails.length && (
        <p className={styles.mobileNumberSelectedEmailsText}>
          {selectedEmailsInvited} / ∞
        </p>
      )}

      {!!addedEmails.length && (
        <div className={styles.emailsWrapper}>
          {addedEmails.map(({ email, name }, i) => (
            <div key={i} className={styles.emailWrapper}>
              <div className={styles.email}>
                <p>{email}</p>
                <div
                  className={styles.cross}
                  onClick={() => deleteEmail(email)}
                >
                  <Cross />
                </div>
              </div>

              <Input
                value={name}
                onChange={(newName) => {
                  const findEmailIndex = addedEmails.findIndex(
                    (addedEmail) => addedEmail.email === email,
                  )

                  if (!~findEmailIndex) return

                  const addedEmailsCopy = [...addedEmails]

                  addedEmailsCopy[findEmailIndex] = {
                    ...addedEmailsCopy[findEmailIndex],
                    name: newName,
                  }

                  setAddedEmails(addedEmailsCopy)
                }}
                placeholder={`Name: ${email}`}
                autoComplete="off"
                inputWrapper2ClassName={styles.emailInputWrapper}
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

type InviteListWrapperProps = {
  selectedMembers: SelectedMember[]
  setSelectedMembers: Dispatch<
    SetStateAction<InviteListWrapperProps['selectedMembers']>
  >
  isShowSelectedEmails: boolean
  membersInfo?: UsersResponseData | undefined
  addedEmails?: AddedEmail[]
  setAddedEmails?: Dispatch<SetStateAction<AddedEmail[]>>
}

export const InviteListMemoized = memo(function InviteList({
  membersInfo,
  selectedMembers,
  setSelectedMembers,
  isShowSelectedEmails,
  addedEmails = [],
  setAddedEmails,
}: InviteListWrapperProps) {
  type EmailListItem = SelectedMember | AddedEmail | UserResponseData

  function handlingSelect(item: EmailListItem) {
    const isItemSelectedMember = 'userId' in item || 'id' in item

    const emailItem = (
      (isItemSelectedMember ? selectedMembers : addedEmails) as (
        | SelectedMember
        | AddedEmail
      )[]
    ).find((selectedEmail) => selectedEmail.email === item.email)

    if (emailItem) {
      function removeElementFromArray<
        TState extends SelectedMember[] | AddedEmail[] = SelectedMember[],
      >(state: TState, setState: Dispatch<SetStateAction<TState>>) {
        const arr = [...state] as TState
        arr.splice(
          arr.findIndex((arrItem) => arrItem.email === item.email),
          1,
        )
        setState(arr)
      }

      if (isItemSelectedMember) {
        removeElementFromArray(selectedMembers, setSelectedMembers)
      } else {
        if (setAddedEmails) removeElementFromArray(addedEmails, setAddedEmails)
      }
    } else {
      if ('id' in item) {
        setSelectedMembers((prev) => [
          ...prev,
          {
            userId: item.id,
            email: item.email,
            name: item.display_name,
            removed: false,
          },
        ])
      } else {
        if (setAddedEmails)
          setAddedEmails((prev) => [
            ...prev,
            {
              email: item.email,
              name: '',
              removed: false,
            },
          ])
      }
    }
  }

  const emailList: EmailListItem[] = isShowSelectedEmails
    ? [...selectedMembers, ...addedEmails]
    : membersInfo ?? []

  return emailList.length ? (
    <div className={styles.inviteListWrapper}>
      {emailList.map((item, i) => (
        <InviteItem
          key={i}
          item={item}
          isSelected={
            !!(isShowSelectedEmails ? emailList : selectedMembers).find(
              (emailListItem) => emailListItem.email === item.email,
            )
          }
          onChange={() => handlingSelect(item)}
          isShowSelectedEmails={isShowSelectedEmails}
          selectedMembers={selectedMembers}
          setSelectedMembers={setSelectedMembers}
          addedEmails={addedEmails}
          setAddedEmails={setAddedEmails}
        />
      ))}
    </div>
  ) : null
})

type InviteItemProps = {
  item: SelectedMember | AddedEmail | UserResponseData
  isSelected: boolean
  onChange: () => void
  isShowSelectedEmails: boolean
  selectedMembers: SelectedMember[]
  setSelectedMembers: Dispatch<
    SetStateAction<InviteItemProps['selectedMembers']>
  >
  addedEmails?: AddedEmail[]
  setAddedEmails?: Dispatch<SetStateAction<AddedEmail[]>>
}

export function InviteItem({
  item,
  isSelected,
  onChange,
  isShowSelectedEmails,
  selectedMembers,
  setSelectedMembers,
  addedEmails = [],
  setAddedEmails,
}: InviteItemProps) {
  const displayName =
    'display_name' in item
      ? item.display_name
      : 'name' in item && item.name.trim()
      ? item.name.trim()
      : item.email

  const isRemoved = 'removed' in item ? item.removed : false

  function toggleStateRemoved<
    TState extends SelectedMember[] | AddedEmail[] = SelectedMember[],
  >(state: TState, setState: Dispatch<SetStateAction<TState>>) {
    const stateCopy = [...state] as TState

    const index = stateCopy.findIndex(
      (stateItem) => stateItem.email === item.email,
    )
    if (~index) {
      stateCopy[index] = {
        ...stateCopy[index],
        removed: !stateCopy[index].removed,
      }
      setState(stateCopy)
    }
  }

  return (
    <div
      className={classNames(styles.inviteItemWrapper, {
        [styles.inviteItemWrapperNotClicked]: isShowSelectedEmails,
      })}
      onClick={() => !isShowSelectedEmails && onChange()}
    >
      <div
        className={classNames(styles.logo, {
          [styles.selected]: isSelected && !isRemoved,
        })}
      >
        {!isSelected || isRemoved ? (
          `${getShortName(displayName).toUpperCase()}`
        ) : (
          <CheckMark />
        )}
      </div>

      <div className={styles.infoWrapper}>
        <p className={styles.memberName}>{displayName}</p>
        <p className={styles.emailText}>{item.email}</p>
      </div>

      {isShowSelectedEmails && 'removed' in item && (
        <div className={styles.removeAndInviteButtonsWrapper}>
          <button
            className={classNames('button', {
              'button-black-outline': !item.removed,
              'button-blue-light': item.removed,
            })}
            onClick={() => {
              if ('userId' in item) {
                toggleStateRemoved(selectedMembers, setSelectedMembers)
              } else {
                if (setAddedEmails) {
                  toggleStateRemoved(addedEmails, setAddedEmails)
                }
              }
            }}
          >
            {!item.removed ? 'Remove' : 'Invite'}
          </button>
        </div>
      )}
    </div>
  )
}
