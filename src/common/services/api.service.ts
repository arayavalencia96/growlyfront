import { environment } from '@/common/config/environment'
import { HttpService } from '@/common/services/http.service'
import { sessionService } from '@/common/services/session.service'

export const apiService = new HttpService(environment.apiUrl, sessionService)
