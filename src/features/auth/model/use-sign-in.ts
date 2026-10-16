import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { sessionActions, type Credentials } from '@/entities/session'
import { getStateInstance } from '@/shared/api'
import { translate } from '@/shared/i18n'

const KNOWN_STATES = ['notAuthorized', 'blocked', 'starting', 'suspended', 'pendingPassword']

export function useSignIn() {
  return useMutation({
    mutationKey: ['sign-in'],
    mutationFn: async (credentials: Credentials) => {
      const { stateInstance } = await getStateInstance(credentials)
      return { credentials, stateInstance }
    },
    onSuccess: ({ credentials, stateInstance }) => {
      sessionActions.signIn(credentials)
      if (stateInstance === 'authorized') {
        toast.success(translate('auth.connected'), {
          description: `idInstance ${credentials.idInstance}`,
        })
        return
      }
      toast.warning(translate('auth.connectedNotReady'), {
        description: KNOWN_STATES.includes(stateInstance)
          ? translate(`auth.state.${stateInstance}`)
          : translate('auth.state.unknown', { state: stateInstance }),
      })
    },
  })
}
