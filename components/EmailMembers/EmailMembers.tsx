import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { CheckMark, Cross, StepArrow } from '@/assets/icons'
import { Input, RHFInput, Select, TextArea } from '@/features/ui'
import { useMessage, usePool } from '@/helpers'

import styles from './EmailMembers.module.scss'

const inputs = [
  { id: 1, email: 'davidouski@gmail.com', name: 'Siarhei' },
  { id: 2, email: 'davidouski1@gmail.com', name: 'Siarhei1' },
  { id: 3, email: 'davidouski2@gmail.com', name: 'Siarhei2' },
  { id: 4, email: 'davidouski3@gmail.com', name: 'Siarhei3' },
  { id: 5, email: 'davidouski4@gmail.com', name: 'Siarhei4' },
  { id: 6, email: 'davidouski5@gmail.com', name: 'Siarhei5' },
]

const emailTemplateList = [
  { title: 'Blank', name: 'blank' },
  {
    title: 'Invite Existing Pool Members',
    name: 'invite-existing-pool-members',
  },
]

export function EmailMembers() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  const [step, setStep] = useState<1 | 2>(1)

  const [option1, setOption1] = useState<'all' | 'active' | 'inactive' | null>(
    null,
  )
  const [option2, setOption2] = useState<
    'has-not-been-confirmed' | 'has-been-confirmed' | null
  >(null)

  const [option3, setOption3] = useState<
    'without-picks' | 'having-picks' | null
  >(null)

  useEffect(() => {
    setOption2(null)
  }, [option1])

  useEffect(() => {
    setOption3(null)
  }, [option2])

  const { control, reset } = useForm()

  const [inputArr, setInputArr] = useState(inputs)

  const [emailTemplate, setEmailTemplate] = useState(emailTemplateList[0].name)
  const [subject, setSubject] = useState('')
  const [bodyValue, setBodyValue] = useState('')

  const [copied, setIsCopied] = useMessage(1000)

  useEffect(() => {
    if (poolData) {
      if (emailTemplate === 'blank') {
        setBodyValue('')
      }
      if (emailTemplate === 'invite-existing-pool-members') {
        setBodyValue(
          `##first-name##,\n\nI'm sending you this email to invite you back to my ${poolData.pool_type.title} pool named '${poolData.name}' for this season. Simply sign in to your existing account from last year using the following information:\n\nSign-in URL: upool.us/qwertyui\nForgot your sign-in info? upool.us/qwertyui\n\nThanks,\n${poolData.owner.first_name}`,
        )
      }
    }
  }, [emailTemplate, poolData])

  function copyEmails() {
    const text = inputArr.reduce((acc, item, i) => {
      if (i !== 0) {
        acc += `, ${item.email}`
      } else {
        acc += item.email
      }
      return acc
    }, '')

    navigator.clipboard.writeText(text).then(() => setIsCopied('copied'))
  }

  function removeEmail(emailId: number) {
    const newEmailsList = inputArr.filter((item) => item.id !== emailId)
    setInputArr(newEmailsList)
    reset(
      newEmailsList.reduce(
        (acc, item) => (acc = { ...acc, [item.id]: item.name }),
        {},
      ),
    )
  }

  const isNextButtonDisabled = option1 === null

  const isSendEmailDisabled =
    !inputArr.length || !subject.trim() || !bodyValue.trim()

  const buttonsDisabled = {
    option1: {
      all: option1 !== null && option1 !== 'all',
      active: option1 !== null && option1 !== 'active',
      inactive: option1 !== null && option1 !== 'inactive',
    },
    option2: {
      hasNotBeenConfirmed:
        option1 === 'all' ||
        option1 === 'inactive' ||
        (option2 !== null && option2 !== 'has-not-been-confirmed'),
      hasBeenConfirmed:
        option1 === null ||
        option1 === 'all' ||
        (option2 !== null && option2 !== 'has-been-confirmed'),
    },
    option3: {
      withoutPicks:
        option2 === null ||
        (option3 !== null && option3 !== 'without-picks') ||
        (option1 === 'all' && option2 === 'has-not-been-confirmed') ||
        (option1 === 'active' && option2 === 'has-not-been-confirmed'),
      havingsPicks:
        option2 === null ||
        (option3 !== null && option3 !== 'having-picks') ||
        (option1 === 'all' && option2 === 'has-not-been-confirmed') ||
        (option1 === 'active' && option2 === 'has-not-been-confirmed'),
    },
  }

  return (
    <div className={styles.wrapper}>
      {step === 1 && (
        <div className={styles.step1}>
          <div className={styles.emailRecipientSelectionWrapper}>
            <div className={styles.emailRecipientSelectionDescription}>
              <div className={styles.stepsWrapper}>
                <p className={styles.stepActive}>Step 1</p>
                <StepArrow />
                <p
                  className={classNames({
                    [styles.stepDisabled]: isNextButtonDisabled,
                  })}
                  onClick={() => !isNextButtonDisabled && setStep(2)}
                >
                  Step 2
                </p>
              </div>

              <p className={styles.title}>Email Recipient Selection</p>

              <p className={styles.text}>
                Select members to email. Select one appropriate option from the
                list offered. You can also choose other characteristics for the
                desired/preferred group of members.
              </p>
            </div>

            <div className={styles.options}>
              <div>
                <p>Pool members</p>
                <div className={styles.poolMembers}>
                  <button
                    className={classNames('button button-blue-light-outline', {
                      [styles.optionActive]: option1 === 'all',
                      disabled: buttonsDisabled.option1.all,
                    })}
                    onClick={() => setOption1(option1 === 'all' ? null : 'all')}
                  >
                    All
                  </button>

                  <button
                    className={classNames('button button-blue-light-outline', {
                      [styles.optionActive]: option1 === 'active',
                      disabled: buttonsDisabled.option1.active,
                    })}
                    onClick={() =>
                      setOption1(option1 === 'active' ? null : 'active')
                    }
                  >
                    Active
                  </button>

                  <button
                    className={classNames('button button-blue-light-outline', {
                      [styles.optionActive]: option1 === 'inactive',
                      disabled: buttonsDisabled.option1.inactive,
                    })}
                    onClick={() =>
                      setOption1(option1 === 'inactive' ? null : 'inactive')
                    }
                  >
                    Inactive
                  </button>
                </div>
              </div>

              <div>
                <p>All pool members for whom participation</p>
                <div>
                  <button
                    className={classNames('button button-blue-light-outline', {
                      [styles.optionActive]:
                        option2 === 'has-not-been-confirmed',
                      disabled: buttonsDisabled.option2.hasNotBeenConfirmed,
                    })}
                    onClick={() =>
                      setOption2(
                        option2 === 'has-not-been-confirmed'
                          ? null
                          : 'has-not-been-confirmed',
                      )
                    }
                  >
                    Has not been confirmed
                  </button>

                  <button
                    className={classNames('button button-blue-light-outline', {
                      [styles.optionActive]: option2 === 'has-been-confirmed',
                      disabled: buttonsDisabled.option2.hasBeenConfirmed,
                    })}
                    onClick={() =>
                      setOption2(
                        option2 === 'has-been-confirmed'
                          ? null
                          : 'has-been-confirmed',
                      )
                    }
                  >
                    Has been confirmed
                  </button>
                </div>
              </div>

              <div>
                <p>Pool members who entered</p>
                <div>
                  <button
                    className={classNames('button button-blue-light-outline', {
                      [styles.optionActive]: option3 === 'without-picks',
                      disabled: buttonsDisabled.option3.withoutPicks,
                    })}
                    onClick={() =>
                      setOption3(
                        option3 === 'without-picks' ? null : 'without-picks',
                      )
                    }
                  >
                    Without picks
                  </button>

                  <button
                    className={classNames('button button-blue-light-outline', {
                      [styles.optionActive]: option3 === 'having-picks',
                      disabled: buttonsDisabled.option3.havingsPicks,
                    })}
                    onClick={() =>
                      setOption3(
                        option3 === 'having-picks' ? null : 'having-picks',
                      )
                    }
                  >
                    Having picks
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            className={classNames('button button-blue-light', styles.next, {
              disabled: isNextButtonDisabled,
            })}
            onClick={() => setStep(2)}
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className={styles.step2}>
          <div className={styles.sendingMailWrapper}>
            <div className={styles.sendingMailDescription}>
              <div className={styles.stepsWrapper}>
                <p onClick={() => setStep(1)}>Step 1</p>
                <StepArrow />
                <p className={styles.stepActive}>Step 2</p>
              </div>

              <p className={styles.title}>Sending mail</p>

              <div className={styles.descriptionWrapper}>
                <p>
                  At this point, you can send an email both via{' '}
                  <span>your email client</span> (for example, Gmail or
                  Outlook), by copying all the email addresses matched to your
                  request, or using <span>our client.</span>
                </p>

                <p>
                  Please, follow the instructions for selecting the{' '}
                  <span>Upool client.</span>
                </p>

                <p>
                  Remember that when you send an email by this method there is{' '}
                  <span>a high chance</span> of it getting caught in{' '}
                  <span>the spam filter</span>, as well as the impossibility of
                  tracking the status of the email
                </p>
              </div>
            </div>

            <div className={styles.sendingMail}>
              <div className={styles.recipientsWrapper}>
                <p>
                  Recipients: <span>{inputArr.length}</span>
                </p>

                <button
                  className={classNames('button button-blue-outline', {
                    [styles.copied]: copied,
                  })}
                  onClick={() => !copied && copyEmails()}
                >
                  {copied ? (
                    <>
                      <p>Copied</p>
                      <CheckMark />
                    </>
                  ) : (
                    <p>Copy all emails</p>
                  )}
                </button>
              </div>

              {!!inputArr.length && (
                <div className={styles.emailsListWrapper}>
                  {inputArr.map((item) => (
                    <div key={item.id}>
                      <div className={styles.emailWrapper}>
                        <p>{item.email}</p>
                        <div
                          className={styles.crossWrapper}
                          onClick={() => removeEmail(item.id)}
                        >
                          <Cross />
                        </div>
                      </div>
                      <RHFInput
                        control={control}
                        name={String(item.id)}
                        placeholder="Name"
                        defaultValue={item.name}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.form}>
                <Select
                  value={emailTemplate}
                  onChange={setEmailTemplate}
                  placeholder="Email template"
                  withLabel
                  options={emailTemplateList}
                />

                <Input
                  value={subject}
                  onChange={setSubject}
                  placeholder="Subject"
                  withLabel
                />

                <TextArea
                  value={bodyValue}
                  onChange={setBodyValue}
                  placeholder="Body"
                  withLabel
                  className={styles.textarea}
                />
              </div>
            </div>
          </div>

          <button
            className={classNames(
              'button button-blue-light',
              styles.sendEmail,
              { disabled: isSendEmailDisabled },
            )}
          >
            Send Email
          </button>
        </div>
      )}
    </div>
  )
}
