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

// Types
export type Turma = {
  id: number
  nome: string
  semestre: string
  ano: number
  professor_id: number
}

export type Professor = {
  id: number
  nome: string
}

// Columns definition
export const columns: ColumnDef<Turma>[] = [
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
  {
    accessorKey: 'professor',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Professor
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('professor')}</div>,
  },
  {
    id: 'actions',
  },
]

export default function Turmas() {
  const [data, setData] = useState<Turma[]>([])
  const [professores, setProfessores] = useState<Professor[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false)
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false)
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false)
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null)
  const [newTurma, setNewTurma] = useState<Turma>({
    id: 0,
    nome: '',
    semestre: '',
    ano: 0,
    professor_id: 0,
  })
  const clearTurma = () => {
    setNewTurma({
      id: 0,
      nome: '',
      semestre: '',
      ano: 0,
      professor_id: 0,
    })
  }

  // Fetch Turmas

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

  // Fetch Professores

  const fetchProfessores = async () => {
    try {
      const response = await axios.get(
        'http://129.148.34.197:3000/api/professor/listarTodos',
      )
      setProfessores(response.data['data.omitempty'])
    } catch (error) {
      console.error('Erro ao buscar professores:', error)
    }
  }

  useEffect(() => {
    fetchTurmas()
    fetchProfessores()
  }, [])

  const handleAddTurma = async () => {
    try {
      if (newTurma.professor_id === 0) {
        console.error('Selecione um professor.')
        return
      }

      const response = await axios.post(
        'http://129.148.34.197:3000/api/turma/criarTurma',
        newTurma,
      )

      setData((prevData) => [...prevData, response.data])

      setIsAddPopupOpen(false)
      clearTurma()
      fetchTurmas()
      fetchProfessores()
      return toast.success('Turma criada com Sucesso!')
    } catch (error) {
      return toast.error('Preencha todos os campos!')
      console.error('Erro ao cadastrar turma:', error)
    }
  }

  const handleEditClick = (turma: Turma) => {
    setSelectedTurma(turma)
    setNewTurma(turma)
    setIsEditPopupOpen(true)
  }

  const handleEditTurma = async () => {
    if (selectedTurma) {
      try {
        await axios.put(
          `http://129.148.34.197:3000/api/turma/atualizar/${selectedTurma.id}`,
          newTurma,
        )
        setData((prevData) =>
          prevData.map((t) => (t.id === selectedTurma.id ? newTurma : t)),
        )
        setIsEditPopupOpen(false)
        return toast.success('Turma editada com Sucesso!')
      } catch (error) {
        console.error('Erro ao editar turma:', error)
      }
    }
  }

  const handleDeleteClick = (turma: Turma) => {
    setSelectedTurma(turma)
    setIsDeletePopupOpen(true)
  }

  const handleDeleteTurma = async () => {
    if (selectedTurma) {
      try {
        await axios.delete(
          `http://129.148.34.197:3000/api/turma/deletar/${selectedTurma.id}`,
        )
        setData((prevData) => prevData.filter((t) => t.id !== selectedTurma.id))
        setIsDeletePopupOpen(false)
        return toast.success('Turma deletada com Sucesso!')
      } catch (error) {
        console.error('Erro ao deletar turma:', error)
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
        <Button onClick={() => setIsAddPopupOpen(true)}>
          <CirclePlus />
          Acionar Turma
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                  {/* Coluna de ações */}
                  <TableCell className="flex flex-row gap-2">
                    <Button
                      onClick={() => handleEditClick(row.original)}
                      variant="outline"
                      color="primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(row.original)}
                      variant={'destructive'}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center">
                  Nenhum dado encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal para Adicionar Turma */}
      {isAddPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            {/* Close Button */}
            <button
              onClick={() => setIsAddPopupOpen(false)}
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Adicionar Turma
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Nome
              </label>
              <Input
                type="text"
                value={newTurma.nome}
                onChange={(e) =>
                  setNewTurma({ ...newTurma, nome: e.target.value })
                }
                placeholder="Nome da turma"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Semestre
              </label>
              <Input
                type="text"
                value={newTurma.semestre}
                onChange={(e) =>
                  setNewTurma({ ...newTurma, semestre: e.target.value })
                }
                placeholder="Semestre"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Ano
              </label>
              <Input
                type="number"
                value={newTurma.ano}
                onChange={(e) =>
                  setNewTurma({ ...newTurma, ano: Number(e.target.value) })
                }
                placeholder="Ano"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Professor
              </label>
              <select
                value={newTurma.professor_id}
                onChange={(e) =>
                  setNewTurma({
                    ...newTurma,
                    professor_id: Number(e.target.value),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={0}>Selecione um professor</option>
                {professores.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-full mt-6">
              <Button onClick={handleAddTurma} className="flex w-full">
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Editar Turma */}
      {isEditPopupOpen && selectedTurma && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            {/* Close Button */}
            <button
              onClick={() => setIsEditPopupOpen(false)}
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
            <h2 className="text-xl font-semibold mb-4">Editar Turma</h2>
            <div className="mb-4">
              <label className="block mb-1">Nome</label>
              <Input
                type="text"
                value={newTurma.nome}
                onChange={(e) =>
                  setNewTurma({ ...newTurma, nome: e.target.value })
                }
                placeholder="Nome da turma"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Semestre</label>
              <Input
                type="text"
                value={newTurma.semestre}
                onChange={(e) =>
                  setNewTurma({ ...newTurma, semestre: e.target.value })
                }
                placeholder="Semestre"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Ano</label>
              <Input
                type="number"
                value={newTurma.ano}
                onChange={(e) =>
                  setNewTurma({ ...newTurma, ano: Number(e.target.value) })
                }
                placeholder="Ano"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Professor</label>
              <select
                value={newTurma.professor_id}
                onChange={(e) =>
                  setNewTurma({
                    ...newTurma,
                    professor_id: Number(e.target.value),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={0}>Selecione um professor</option>
                {professores.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-full gap-2">
              <Button className="w-full" onClick={handleEditTurma}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Deletar Turma */}
      {isDeletePopupOpen && selectedTurma && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
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
            <h2 className="text-xl font-semibold mb-4">Excluir Turma</h2>
            <p>
              Tem certeza de que deseja excluir a turma: {selectedTurma.nome}?
            </p>
            <div className="flex w-full mt-4">
              <Button
                className="w-full"
                onClick={handleDeleteTurma}
                variant="destructive"
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
