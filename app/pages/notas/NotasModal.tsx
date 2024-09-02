'use client'
import { useState } from 'react'
import axios from 'axios'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type Aluno = {
  id: number
  nome: string
}

interface NotasModalProps {
  atividadeId: number
  turmaId: number
  isOpen: boolean
  onClose: () => void
  alunos: Aluno[]
}

export default function NotasModal({
  atividadeId,
  turmaId,
  isOpen,
  onClose,
  alunos,
}: NotasModalProps) {
  const [notas, setNotas] = useState<Record<number, number>>({})

  const handleSubmitNotas = async () => {
    try {
      for (const alunoId of Object.keys(notas)) {
        await axios.post('http://129.148.34.197:3000/api/nota/criarNota', {
          Valor: notas[parseInt(alunoId)],
          alunoId: parseInt(alunoId),
          AtividadeId: atividadeId,
        })
      }
      alert('Notas enviadas com sucesso!')
      onClose()
    } catch (error) {
      console.error('Erro ao enviar notas:', error)
      alert('Erro ao enviar notas.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold">Atribuir Notas</h2>
      <ul>
        {alunos.map((aluno) => (
          <li key={aluno.id}>
            <div>{aluno.nome}</div>
            <Input
              type="number"
              value={notas[aluno.id] || ''}
              onChange={(e) =>
                setNotas((prev) => ({
                  ...prev,
                  [aluno.id]: Number(e.target.value),
                }))
              }
              placeholder="Nota"
            />
          </li>
        ))}
      </ul>
      <Button onClick={handleSubmitNotas}>Salvar Notas</Button>
      <Button onClick={onClose}>Fechar</Button>
    </Modal>
  )
}
