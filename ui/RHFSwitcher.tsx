import {
  FieldValues,
  RegisterOptions,
  useController,
  UseControllerProps,
  Control,
  FieldPath,
  PathValue,
} from 'react-hook-form'

import { Switcher } from '@/features/ui'
import type { SwitcherProps } from '@/features/ui/Switcher/Switcher'

type RHFSwitcherProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  name: UseControllerProps['name']
  required?: RegisterOptions['required']
  defaultValue?: PathValue<FieldValues, FieldPath<FieldValues>>
  children?: SwitcherProps['children']
  onChangeEvent?: SwitcherProps['onChangeEvent']
}

export function RHFSwitcher({
  control,
  name,
  required,
  defaultValue = false,
  children,
  onChangeEvent,
}: RHFSwitcherProps) {
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ control, name, defaultValue, rules: { required } })

  return (
    <Switcher
      value={value}
      onChange={onChange}
      error={error?.message}
      onChangeEvent={onChangeEvent}
    >
      {children}
    </Switcher>
  )
}
