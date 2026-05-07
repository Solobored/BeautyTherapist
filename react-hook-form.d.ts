declare module 'react-hook-form' {
  import * as React from 'react'

  export type FieldValues = Record<string, unknown>
  export type FieldPath<TFieldValues extends FieldValues = FieldValues> = keyof TFieldValues & string
  export type ControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  > = {
    name: TName
    control?: unknown
    render?: (...args: unknown[]) => React.ReactNode
  }

  export const Controller: React.ComponentType<ControllerProps>
  export const FormProvider: React.ComponentType<React.PropsWithChildren<Record<string, unknown>>>
  export function useFormContext(): {
    getFieldState: (...args: unknown[]) => Record<string, unknown>
  }
  export function useFormState(...args: unknown[]): Record<string, unknown>
}
