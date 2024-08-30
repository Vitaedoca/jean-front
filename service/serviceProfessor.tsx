import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: 'http://129.148.34.197:3000',
})

export class LoginService {
  listProfessor() {
    return axiosInstance.get('/api/professor/listarTodos')
  }

  login(email: string, password: string) {
    return axiosInstance.post('/auth/login', {
      email,
      password,
    })
  }
}
