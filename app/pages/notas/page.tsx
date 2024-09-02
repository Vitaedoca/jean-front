'use client'
import { useEffect, useState } from 'react'
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
} from '@tanstack/react-table'
import axios from 'axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog } from '@headlessui/react'
import toast from 'react-hot-toast'

// Tipos
export type Turma = {
  id: number
  nome: string
  semestre: string
  ano: number
}

export type Atividade = {
  id: number
  nome: string
  valor: number
  data: string
}

export type Aluno = {
  id: number
  nome: string
  matricula: string
}

export type Nota = {
  valor: number
  atividade: Atividade
}

// Definição das colunas
const columns: ColumnDef<Turma>[] = [
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
    accessorKey: 'semestre',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Semestre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue('semestre')}</div>
    ),
  },
  {
    accessorKey: 'ano',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Ano
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('ano')}</div>,
  },
]

export default function Notas() {
  const [data, setData] = useState<Turma[]>([])
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [notas, setNotas] = useState<Record<number, Nota[]>>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null)
  const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(
    null,
  )
  const [selectedNotas, setSelectedNotas] = useState<Record<number, number>>({})
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null)

  const [isAtividadesModalOpen, setAtividadesModalOpen] = useState(false)
  const [isAlunosModalOpen, setAlunosModalOpen] = useState(false)

  // Busca Turmas
  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const response = await axios.get(
          'http://129.148.34.197:3000/api/turma/listarTodos',
        )
        setData(response.data['data.omitempty'])
      } catch (error) {
        console.error('Erro ao buscar turmas:', error)
      }
    }
    fetchTurmas()
  }, [])

  // Busca Atividades da Turma Selecionada
  useEffect(() => {
    if (selectedTurma) {
      const fetchAtividades = async () => {
        try {
          const response = await axios.get(
            `http://129.148.34.197:3000/api/turma/listar-atividades/${selectedTurma.id}`,
          )
          setAtividades(response.data)
        } catch (error) {
          console.error('Erro ao buscar atividades:', error)
        }
      }
      fetchAtividades()
    } else {
      setAtividades([])
    }
  }, [selectedTurma])

  // Busca Alunos da Atividade Selecionada
  useEffect(() => {
    if (selectedAtividade && selectedTurma) {
      const fetchAlunos = async () => {
        try {
          const response = await axios.get(
            `http://129.148.34.197:3000/api/turma/listar/${selectedTurma.id}`,
          )
          setAlunos(response.data['data.omitempty'].alunos)
        } catch (error) {
          console.error('Erro ao buscar alunos:', error)
        }
      }
      fetchAlunos()
    } else {
      setAlunos([])
    }
  }, [selectedAtividade, selectedTurma])

  // Busca Notas dos Alunos
  useEffect(() => {
    if (alunos.length > 0) {
      const fetchNotas = async () => {
        try {
          const fetchedNotas: Record<number, Nota[]> = {}
          for (const aluno of alunos) {
            const response = await axios.get(
              `http://129.148.34.197:3000/api/nota/listar/${aluno.id}`,
            )
            fetchedNotas[aluno.id] = response.data['data.omitempty']
          }
          setNotas(fetchedNotas)
        } catch (error) {
          console.error('Erro ao buscar notas:', error)
        }
      }
      fetchNotas()
    }
  }, [alunos])

  // Submete Notas
  const handleSubmitNotas = async () => {
    try {
      await Promise.all(
        Object.keys(selectedNotas).map((alunoId) =>
          axios.post('http://129.148.34.197:3000/api/nota/criarNota', {
            Valor: selectedNotas[parseInt(alunoId)],
            alunoId: parseInt(alunoId),
            AtividadeId: selectedAtividade?.id,
          }),
        ),
      )
      setAlunosModalOpen(false)
      setAtividadesModalOpen(false)
      return toast.success('Nota enviadas com sucesso!!')
    } catch (error) {
      setAlunosModalOpen(false)
      setAtividadesModalOpen(false)
      return toast.error('Erro! Já existe nota!!')
    }
  }

  // Configuração da Tabela
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex justify-between py-4">
        <Input
          placeholder="Filtrar nomes..."
          value={(table.getColumn('nome')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('nome')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <div className="flex items-center justify-between">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer"
              onClick={() => {
                setSelectedTurma(row.original)
                setAtividadesModalOpen(true)
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTurma(row.original)
                    setAtividadesModalOpen(true)
                  }}
                >
                  Ver Atividades
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal de Atividades */}
      <Dialog
        open={isAtividadesModalOpen}
        onClose={() => setAtividadesModalOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
              Atividades da Turma {selectedTurma?.nome}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              Selecione uma atividade para adicionar notas.
            </Dialog.Description>
            <div className="mt-4">
              {atividades && atividades.length > 0 ? (
                <ul className="space-y-2">
                  {atividades.map((atividade) => (
                    <li
                      key={atividade.id}
                      className="flex justify-between items-center"
                    >
                      <span>{atividade.nome}</span>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedAtividade(atividade)
                          setAlunosModalOpen(true)
                        }}
                      >
                        Ver Alunos
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">
                  Nenhuma atividade encontrada para esta turma.
                </div>
              )}
            </div>
          </div>
        </div>
      </Dialog>

      {/* Modal de Alunos */}
      <Dialog
        open={isAlunosModalOpen}
        onClose={() => setAlunosModalOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
              Alunos da Atividade {selectedAtividade?.nome}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              Selecione um aluno para adicionar a nota.
            </Dialog.Description>
            <div className="mt-4">
              {alunos.length > 0 ? (
                <ul className="space-y-2">
                  {alunos.map((aluno) => (
                    <li
                      key={aluno.id}
                      className="flex justify-between items-center"
                    >
                      <span>{aluno.nome}</span>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedAluno(aluno)
                          setSelectedNotas((prev) => ({
                            ...prev,
                            [aluno.id]: prev[aluno.id] || 0,
                          }))
                        }}
                      >
                        Adicionar Nota
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">Nenhum aluno encontrado.</div>
              )}
            </div>

            {/* Campo para Adicionar Nota */}
            {selectedAluno && (
              <div className="mt-4">
                <Input
                  type="number"
                  placeholder="Nota"
                  value={selectedNotas[selectedAluno.id] || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    setSelectedNotas((prev) => ({
                      ...prev,
                      [selectedAluno.id]: isNaN(value) ? 0 : value,
                    }))
                  }}
                />
                <Button
                  type="button"
                  className="mt-2"
                  onClick={() => {
                    setSelectedAluno(null)
                    handleSubmitNotas()
                  }}
                >
                  Salvar Nota
                </Button>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  )
}
