import { environment } from '../../environments/environment';

export abstract class ApiService {
  protected apiUrl = environment.apiUrl;
}
