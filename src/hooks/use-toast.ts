
import * as React from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast> & { id: string }
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        toastTimeouts.set(
          toastId,
          setTimeout(() => {
            toastTimeouts.delete(toastId)
          }, TOAST_REMOVE_DELAY)
        )
      } else {
        for (const [, timeout] of toastTimeouts) {
          clearTimeout(timeout)
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
              }
            : t
        ),
      }
    }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// Create a stable singleton dispatch function
let dispatch: React.Dispatch<Action> | null = null
let listeners: Array<() => void> = []

const getState = (): State => {
  if (!dispatch) {
    return { toasts: [] }
  }
  // This will be properly managed by the React component
  return { toasts: [] }
}

const useToast = () => {
  const [state, localDispatch] = React.useReducer(reducer, {
    toasts: [],
  })

  // Set the global dispatch on first render
  React.useEffect(() => {
    dispatch = localDispatch
    return () => {
      dispatch = null
    }
  }, [localDispatch])

  React.useEffect(() => {
    return () => {
      for (const [, timeout] of toastTimeouts) {
        clearTimeout(timeout)
      }
    }
  }, [])

  const toast = React.useMemo(
    () => ({
      ...state,
      toast: (props: Omit<ToasterToast, "id">) => {
        const id = genId()

        if (dispatch) {
          dispatch({
            type: actionTypes.ADD_TOAST,
            toast: {
              id,
              ...props,
            },
          })
        }

        return id
      },
      update: (props: Partial<ToasterToast> & { id: string }) => {
        if (dispatch) {
          dispatch({
            type: actionTypes.UPDATE_TOAST,
            toast: props,
          })
        }
      },
      dismiss: (toastId?: string) => {
        if (dispatch) {
          dispatch({
            type: actionTypes.DISMISS_TOAST,
            toastId,
          })
        }
      },
      remove: (toastId?: string) => {
        if (dispatch) {
          dispatch({
            type: actionTypes.REMOVE_TOAST,
            toastId,
          })
        }
      },
    }),
    [state]
  )

  return toast
}

// Standalone toast function for non-React contexts
const toast = (props: Omit<ToasterToast, "id">) => {
  const id = genId()

  if (dispatch) {
    dispatch({
      type: actionTypes.ADD_TOAST,
      toast: {
        id,
        ...props,
      },
    })
  }

  return id
}

// Export both the hook and a simple toast function
export { useToast, toast }
export type { ToasterToast }
