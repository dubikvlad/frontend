/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react'
import { UseFormSetValue } from 'react-hook-form'

import { getAllMonthsAndDays, getDaysInMonth, months } from '@/config/constants'
import { DefaultSwiper } from '@/features/ui'

import styles from './DateSwiper.module.scss'

export function DateSwiper({
  startDate,
  endDate,
  value,
  setValue,
  name,
}: {
  startDate?: string
  endDate?: string
  value: string
  setValue: UseFormSetValue<any>
  name: string
}) {
  const [monthIndex, setMonthIndex] = useState(0)

  const monthsArray = getAllMonthsAndDays(startDate, endDate)

  const [dayIndex, setDayIndex] = useState(0)

  const [monthData, daysdata, selectedDate] = useMemo(() => {
    const selectedMonth = monthsArray[monthIndex]
    const selectedDay = selectedMonth.days[dayIndex]

    const monthData = monthsArray.map(
      (month) => `${month.monthName} ${month.year}`,
    )
    const daysData = selectedMonth.days.map((day) => ({
      top: day.dayName.slice(0, 3),
      bottom: day.day.toString(),
    }))

    return [
      monthData,
      daysData,
      `${selectedMonth?.year}-${selectedMonth?.id}-${selectedDay?.day}`,
    ]
  }, [monthsArray, monthIndex, dayIndex])

  useEffect(() => {
    const dateFromValue = new Date(value)

    if (dateFromValue) {
      const monthId = monthsArray.findIndex(
        (m) => m.monthName === months[dateFromValue.getMonth()],
      )
      const dayId = monthsArray[monthId]?.days?.findIndex(
        (d) => d.id === dateFromValue.getUTCDate(),
      )

      if (~monthId && ~dayId) {
        setDayIndex(dayId), setMonthIndex(monthId)
      }
    }
  }, [value])

  useEffect(() => {
    setValue(name, selectedDate)
  }, [selectedDate])

  useEffect(() => {
    const selectedMonth = monthsArray[monthIndex]
    const daysInMonth = getDaysInMonth(selectedMonth.year, selectedMonth.id)

    if (dayIndex >= daysInMonth) {
      setDayIndex(0)
    }
  }, [monthIndex])

  return (
    <div className={styles.swiperContainer}>
      <DefaultSwiper
        swiperStyle="default"
        data={monthData}
        activeIndex={monthIndex}
        setActiveIndex={setMonthIndex}
      />
      <DefaultSwiper
        swiperStyle="alt"
        data={daysdata}
        activeIndex={dayIndex}
        setActiveIndex={setDayIndex}
      />
    </div>
  )
}
