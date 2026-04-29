import axios from 'axios'
import { getApiBaseUrl } from '../config/runtimeConfig'

export const http = axios.create({
  baseURL: getApiBaseUrl(),
})
