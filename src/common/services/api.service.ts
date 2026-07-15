import { environment } from '@/common/config/environment'
import { HttpService } from '@/common/services/http.service'

export const apiService = new HttpService(environment.apiUrl)
