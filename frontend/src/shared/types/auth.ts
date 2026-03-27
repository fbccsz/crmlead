export interface LoginInput {
  email: string
  password: string
}

export interface UserSession {
  id: string
  name: string
  email: string
  role: 'corretor' | 'gestor'
  token: string
}
