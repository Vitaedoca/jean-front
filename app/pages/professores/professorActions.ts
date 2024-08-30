import axios from 'axios'

export type Professor = {
  id: number
  nome: string
  email: string
  cpf: string
}

const API_URL = 'http://129.148.34.197:3000/api/professor'

// Função para listar todos os professores
export const fetchProfessors = async (): Promise<Professor[]> => {
  try {
    const response = await axios.get(`${API_URL}/listarTodos`)
    return response.data['data.omitempty']
  } catch (error) {
    console.error('Erro ao buscar professores:', error)
    throw error
  }
}

// Função para criar um novo professor
export const createProfessor = async (
  newProfessor: Professor,
): Promise<Professor> => {
  try {
    const response = await axios.post(`${API_URL}/criarProfessor`, newProfessor)
    return response.data
  } catch (error) {
    console.error('Erro ao cadastrar professor:', error)
    throw error
  }
}

// Função para editar um professor existente
export const updateProfessor = async (
  id: number,
  updatedProfessor: Professor,
): Promise<void> => {
  try {
    await axios.put(`${API_URL}/atualizar/${id}`, updatedProfessor)
  } catch (error) {
    console.error('Erro ao editar professor:', error)
    throw error
  }
}

// Função para excluir um professor
export const deleteProfessor = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/deletar/${id}`)
  } catch (error) {
    console.error('Erro ao deletar professor:', error)
    throw error
  }
}
