'use client'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Atividade } from '../atividades/page'

interface AtividadesModalProps {
  turmaId: number
  atividades: Atividade[]
  isOpen: boolean
  onClose: () => void
  onSelectAtividade: (atividadeId: number) => void
}

export default function AtividadesModal({
  // turmaId,
  atividades,
  isOpen,
  onClose,
  onSelectAtividade,
}: AtividadesModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold">Selecione uma Atividade</h2>
      <ul>
        {atividades.map((atividade) => (
          <li key={atividade.id}>
            <Button onClick={() => onSelectAtividade(atividade.id)}>
              {atividade.nome}
            </Button>
          </li>
        ))}
      </ul>
      <Button onClick={onClose}>Fechar</Button>
    </Modal>
  )
}
