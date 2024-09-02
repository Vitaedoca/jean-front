'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, CirclePlus, Edit, Trash } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import toast from 'react-hot-toast'

export type Aluno = {
  id: number
  nome: string
  matricula: string
}

export type Turma = {
  id: number
  nome: string
}

export type Nota = {
  alunoId: number
  alunoNome: string
  notaId: number
  nota: number
  turmaId: number
  turmaNome: string
  atividadeId: number
  atividadeNome: string
  atividadeValor: number
}

export const columns: ColumnDef<Aluno>[] = [
  {
    accessorKey: 'nome',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Nome
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue('nome')}</div>,
  },
  {
    accessorKey: 'matricula',
    header: 'Matrícula',
    cell: ({ row }) => <div>{row.getValue('matricula')}</div>,
  },
  {
    id: 'actions',
  },
]

export default function Alunos() {
  const [data, setData] = useState<Aluno[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false)
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false)
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false)
  const [isAssociatePopupOpen, setIsAssociatePopupOpen] = useState(false)
  const [isViewNotaPopupOpen, setIsViewNotaPopupOpen] = useState(false)
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null)
  const [newAluno, setNewAluno] = useState<Aluno>({
    id: 0,
    nome: '',
    matricula: '',
  })
  const [selectedTurmaId, setSelectedTurmaId] = useState<number | null>(null)
  const [selectedAlunoId, setSelectedAlunoId] = useState<number | null>(null)
  const [notaAluno, setNotaAluno] = useState<Nota[]>([])
  const [isNotaEditPopupOpen, setIsNotaEditPopupOpen] = useState(false)
  const [selectedNota, setSelectedNota] = useState<Nota | null>(null)
  const [newNota, setNewNota] = useState<number>(0)

  const fetchAlunos = async () => {
    try {
      const response = await axios.get(
        'http://129.148.34.197:3000/api/aluno/listarTodos',
      )
      setData(response.data['data.omitempty'])
      console.log(response.data['data.omitempty'])
    } catch (error) {
      console.error('Erro ao buscar alunos:', error)
    }
  }

  const fetchTurmas = async () => {
    try {
      const response = await axios.get(
        'http://129.148.34.197:3000/api/turma/listarTodos',
      )
      setTurmas(response.data['data.omitempty'])
    } catch (error) {
      console.error('Erro ao buscar turmas:', error)
    }
  }

  useEffect(() => {
    fetchAlunos()
    fetchTurmas()
  }, [])

  const clerAlulno = () => {
    setNewAluno({
      id: 0,
      nome: '',
      matricula: '',
    })
  }

  const handleAddAluno = async () => {
    try {
      const response = await axios.post(
        'http://129.148.34.197:3000/api/aluno/criarAluno',
        newAluno,
      )

      // Adiciona o aluno à lista de dados
      setData((prevData) => [...prevData, response.data])
      setIsAddPopupOpen(false)
      fetchAlunos() // Recarrega os alunos para garantir que a lista esteja atualizada
      clerAlulno()
      return toast.success('Aluno Criado com Sucesso!')
    } catch (error) {
      return toast.error('Erro! Informe um aluno diferente')
    }
    clerAlulno()
  }

  const handleEditClick = (aluno: Aluno) => {
    setSelectedAluno(aluno)
    setNewAluno(aluno)
    setIsEditPopupOpen(true)
  }

  const handleEditAluno = async () => {
    if (selectedAluno) {
      try {
        await axios.put(
          `http://129.148.34.197:3000/api/aluno/atualizar/${selectedAluno.id}`,
          newAluno,
        )
        setData((prevData) =>
          prevData.map((a) => (a.id === selectedAluno.id ? newAluno : a)),
        )
        setIsEditPopupOpen(false)
        return toast.success('Aluno Editado com Sucesso!')
      } catch (error) {
        return toast.error('Erro ao editar aluno!')
        console.error('Erro ao editar aluno:', error)
      }
      clerAlulno()
    }
  }

  const handleDeleteClick = (aluno: Aluno) => {
    setSelectedAluno(aluno)
    setIsDeletePopupOpen(true)
  }

  const handleDeleteAluno = async () => {
    if (selectedAluno) {
      try {
        await axios.delete(
          `http://129.148.34.197:3000/api/aluno/deletar/${selectedAluno.id}`,
        )
        setData((prevData) => prevData.filter((a) => a.id !== selectedAluno.id))
        setIsDeletePopupOpen(false)
        return toast.success('Aluno Excluído com Sucesso!')
      } catch (error) {
        console.error('Erro ao deletar aluno:', error)
      }
    }
  }

  const handleAssociateClick = (aluno: Aluno) => {
    setSelectedAlunoId(aluno.id)
    setIsAssociatePopupOpen(true)
  }

  const handleAssociateAlunoToTurma = async () => {
    if (selectedAlunoId !== null && selectedTurmaId !== null) {
      try {
        await axios.put(
          'http://129.148.34.197:3000/api/turma/adicionarAlunos',
          {
            turma_id: selectedTurmaId,
            alunos_id: [selectedAlunoId],
          },
        )
        setIsAssociatePopupOpen(false)
        return toast.success('Associação realizada com Sucesso!')
      } catch (error) {
        console.error('Erro ao associar aluno à turma:', error)
      }
    }
  }

  const handleViewNotaClick = (aluno: Aluno) => {
    setSelectedAluno(aluno)
    fetchNotaAluno(aluno.id)
    setIsViewNotaPopupOpen(true)
  }

  const fetchNotaAluno = async (alunoId: number) => {
    try {
      const response = await axios.get(
        `http://129.148.34.197:3000/api/aluno/${alunoId}/notas`,
      )
      // Supondo que a resposta é um objeto, extraia a nota
      console.log(response.data['data.omitempty'])
      const notaData = response.data['data.omitempty']

      setNotaAluno(notaData)
    } catch (error) {
      console.error('Erro ao pegar nota do aluno:', error)
      // setNotaAluno(null); // Ou algum valor padrão
    }
  }

  const handleNotaEditClick = (nota: Nota) => {
    setSelectedNota(nota)
    setNewNota(nota.nota) // Inicializa com a nota atual
    setIsNotaEditPopupOpen(true)
  }

  const handleEditNota = async () => {
    if (selectedNota) {
      console.log('Selected Nota:', selectedNota) // Adicione este log

      try {
        await axios.put(
          `http://129.148.34.197:3000/api/nota/atualizar/${selectedNota}`,
          {
            id: selectedNota, // Passando o ID no corpo da requisição
            valor: newNota, // Passando o valor da nota no corpo da requisição
          },
        )
        setNotaAluno((prevNotas) =>
          prevNotas.map((n) =>
            n.notaId === selectedNota.notaId ? { ...n, nota: newNota } : n,
          ),
        )
        setIsNotaEditPopupOpen(false)
        return toast.success('Nota atualizada com sucesso!')
      } catch (error) {
        setIsNotaEditPopupOpen(false)
        return toast.success('Nota atualizada com sucesso!')
      }
    }
  }

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between">
        <Input
          placeholder="Buscar aluno..."
          className="w-1/3"
          onChange={(e) =>
            table.getColumn('nome')?.setFilterValue(e.target.value)
          }
        />
        <Button onClick={() => setIsAddPopupOpen(true)}>
          <CirclePlus />
          Adicionar Aluno
        </Button>
      </div>
      <div className="rounded-md border mt-3">
        <Table className="w-full h-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant={'outline'}
                      onClick={() => handleEditClick(row.original)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={'destructive'}
                      onClick={() => handleDeleteClick(row.original)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleAssociateClick(row.original)}>
                      Associar aluno a turma
                    </Button>
                    <Button
                      variant={'secondary'}
                      onClick={() => handleViewNotaClick(row.original)}
                    >
                      Visualizar Nota
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Add Popup */}
      {isAddPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsAddPopupOpen(false)
                clerAlulno()
              }}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Adicionar Aluno
            </h2>
            <div className="space-y-4">
              <Input
                placeholder="Nome"
                value={newAluno.nome}
                onChange={(e) =>
                  setNewAluno({ ...newAluno, nome: e.target.value })
                }
              />
              <Input
                placeholder="Matrícula"
                value={newAluno.matricula}
                onChange={(e) =>
                  setNewAluno({ ...newAluno, matricula: e.target.value })
                }
              />
            </div>
            <div className="w-full flex justify-center mt-6">
              <Button
                className="w-full flex justify-center"
                onClick={handleAddAluno}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Popup */}
      {isEditPopupOpen && selectedAluno && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsEditPopupOpen(false)
                clerAlulno()
              }}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Editar Aluno
            </h2>
            <div className="space-y-4">
              <Input
                placeholder="Nome"
                value={newAluno.nome}
                onChange={(e) =>
                  setNewAluno({ ...newAluno, nome: e.target.value })
                }
              />
              <Input
                placeholder="Matrícula"
                value={newAluno.matricula}
                onChange={(e) =>
                  setNewAluno({ ...newAluno, matricula: e.target.value })
                }
              />
            </div>
            <div className="w-full flex justify-center mt-6">
              <Button
                className="w-full flex justify-center"
                onClick={handleEditAluno}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Popup */}
      {isDeletePopupOpen && selectedAluno && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
            {/* Close Button */}
            <button
              onClick={() => setIsDeletePopupOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Confirmar Exclusão
            </h2>
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir o aluno{' '}
              <span className="font-semibold">{selectedAluno.nome}</span>?
            </p>
            <div className="w-full flex justify-center mt-6">
              <Button
                className="w-full flex justify-center"
                variant={'destructive'}
                onClick={handleDeleteAluno}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Associate Popup */}
      {isAssociatePopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
            {/* Close Button */}
            <button
              onClick={() => setIsAssociatePopupOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Associar Aluno à Turma
            </h2>
            <p className="text-gray-700 mb-4">
              Selecione a turma à qual deseja associar o aluno:
            </p>
            <select
              value={selectedTurmaId ?? ''}
              onChange={(e) => setSelectedTurmaId(Number(e.target.value))}
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200"
            >
              <option value="" disabled>
                Selecione a turma
              </option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome}
                </option>
              ))}
            </select>
            <div className="w-full flex justify-center mt-6">
              <Button
                className="w-full flex justify-center"
                onClick={handleAssociateAlunoToTurma}
              >
                Associar
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* View Nota Popup */}
      {isViewNotaPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl relative">
            {/* Close Button */}
            <button
              onClick={() => setIsViewNotaPopupOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Notas do Aluno
            </h2>
            {notaAluno && notaAluno.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Turma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Atividade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Nota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Valor da Atividade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {notaAluno.map((nota) => (
                      <tr key={nota.notaId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {nota.turmaNome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {nota.atividadeNome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {nota.nota}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {nota.atividadeValor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex space-x-2">
                          <Button
                            onClick={() => handleNotaEditClick(nota.notaId)}
                            variant={'outline'}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 mt-4">
                Sem notas disponíveis para exibir.
              </p>
            )}
            <div className="mt-6 flex justify-end"></div>
          </div>
        </div>
      )}

      {isNotaEditPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
            <button
              onClick={() => setIsNotaEditPopupOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Editar Nota
            </h2>
            <div className="space-y-4">
              <Input
                placeholder="Nota"
                type="number"
                value={newNota}
                onChange={(e) => setNewNota(parseFloat(e.target.value))}
              />
              <Button onClick={handleEditNota}>Salvar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
