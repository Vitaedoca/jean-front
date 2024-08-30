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

export type Aluno = {
  id: number
  nome: string
  matricula: string
}

export type Turma = {
  id: number
  nome: string
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
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null)
  const [newAluno, setNewAluno] = useState<Aluno>({
    id: 0,
    nome: '',
    matricula: '',
  })
  const [selectedTurmaId, setSelectedTurmaId] = useState<number | null>(null)
  const [selectedAlunoId, setSelectedAlunoId] = useState<number | null>(null)

  const fetchAlunos = async () => {
    try {
      const response = await axios.get(
        'http://129.148.34.197:3000/api/aluno/listarTodos',
      )
      setData(response.data['data.omitempty'])
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

  const handleAddAluno = async () => {
    try {
      const response = await axios.post(
        'http://129.148.34.197:3000/api/aluno/criarAluno',
        newAluno,
      )

      // Adiciona o aluno à lista de dados
      setData((prevData) => [...prevData, response.data])
      setIsAddPopupOpen(false)
      clerAlulno()
      fetchAlunos() // Recarrega os alunos para garantir que a lista esteja atualizada
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error)
    }
    clerAlulno()
  }

  const handleEditClick = (aluno: Aluno) => {
    setSelectedAluno(aluno)
    setNewAluno(aluno)
    setIsEditPopupOpen(true)
  }

  const clerAlulno = () => {
    setNewAluno({
      id: 0,
      nome: '',
      matricula: '',
    })
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
      } catch (error) {
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
      } catch (error) {
        console.error('Erro ao associar aluno à turma:', error)
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
                      onClick={() => handleEditClick(row.original)}
                      variant="outline"
                      color="primary"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(row.original)}
                      color="secondary"
                    >
                      <Trash className="h-4 w-4" />
                      Deletar
                    </Button>
                    <Button
                      onClick={() => handleAssociateClick(row.original)}
                      variant="outline"
                    >
                      Associar à Turma
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Add Aluno Popup */}
      {isAddPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Adicionar Aluno</h2>
            <Input
              placeholder="Nome"
              value={newAluno.nome}
              onChange={(e) =>
                setNewAluno({ ...newAluno, nome: e.target.value })
              }
              className="mb-2"
            />
            <Input
              placeholder="Matrícula"
              value={newAluno.matricula}
              onChange={(e) =>
                setNewAluno({ ...newAluno, matricula: e.target.value })
              }
              className="mb-2"
            />
            <Button onClick={handleAddAluno}>Adicionar</Button>
            <Button
              onClick={() => {
                setIsAddPopupOpen(false)
                clerAlulno()
              }}
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
      {/* Edit Aluno Popup */}
      {isEditPopupOpen && selectedAluno && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Editar Aluno</h2>
            <Input
              placeholder="Nome"
              value={newAluno.nome}
              onChange={(e) =>
                setNewAluno({ ...newAluno, nome: e.target.value })
              }
              className="mb-2"
            />
            <Input
              placeholder="Matrícula"
              value={newAluno.matricula}
              onChange={(e) =>
                setNewAluno({ ...newAluno, matricula: e.target.value })
              }
              className="mb-2"
            />
            <Button onClick={handleEditAluno}>Salvar</Button>
            <Button
              onClick={() => {
                setIsEditPopupOpen(false)
                clerAlulno()
              }}
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
      {/* Delete Aluno Popup */}
      {isDeletePopupOpen && selectedAluno && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Deletar Aluno</h2>
            <p>Tem certeza que deseja deletar o aluno {selectedAluno.nome}?</p>
            <Button onClick={handleDeleteAluno} color="red">
              Confirmar
            </Button>
            <Button
              onClick={() => setIsDeletePopupOpen(false)}
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
      {/* Associate Aluno to Turma Popup */}
      {isAssociatePopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Associar Aluno à Turma</h2>
            <select
              onChange={(e) => setSelectedTurmaId(Number(e.target.value))}
              className="mb-2"
              defaultValue=""
            >
              <option value="" disabled>
                Selecione a Turma
              </option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome}
                </option>
              ))}
            </select>
            <Button onClick={handleAssociateAlunoToTurma}>Associar</Button>
            <Button
              onClick={() => setIsAssociatePopupOpen(false)}
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
