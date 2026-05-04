import { getPayload } from 'payload'
import config from '@payload-config'

// Memoised across HMR — getPayload itself is already singleton-safe in Payload 3
export const getPayloadInstance = async () => getPayload({ config })
