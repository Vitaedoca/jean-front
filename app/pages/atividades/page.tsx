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

export type Atividade = {
  id: number
  nome: string
  valor: number
  data: string
  turma_id: number // ID da turma associada
}

export type Turma = {
  id: number
  nome: string
}

const formatDateToISO = (date: string): string => {
  return `${date}T00:00:00Z`
}

export const columns: ColumnDef<Atividade>[] = [
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
    accessorKey: 'valor',
    header: 'Valor',
    cell: ({ row }) => <div>{row.getValue('valor')}</div>,
  },
  {
    accessorKey: 'data',
    header: 'Data',
    cell: ({ row }) => <div>{row.getValue('data')}</div>,
  },
  {
    id: 'actions',
  },
]

export default function Atividades() {
  const [data, setData] = useState<Atividade[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false)
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false)
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false)
  const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(
    null,
  )
  const [newAtividade, setNewAtividade] = useState<Atividade>({
    id: 0,
    nome: '',
    valor: 0,
    data: '',
    turma_id: 0,
  })

  const clearAtividade = () => {
    setNewAtividade({
      id: 0,
      nome: '',
      valor: 0,
      data: '',
      turma_id: 0,
    })
  }

  const fetchAtividades = async () => {
    try {
      const response = await axios.get(
        'http://129.148.34.197:3000/api/atividade/listarTodos',
      )
      setData(response.data['data.omitempty'] || [])
    } catch (error) {
      console.error('Erro ao buscar atividades:', error)
    }
  }

  const fetchTurmas = async () => {
    try {
      const response = await axios.get(
        'http://129.148.34.197:3000/api/turma/listarTodos',
      )
      setTurmas(response.data['data.omitempty'] || [])
    } catch (error) {
      console.error('Erro ao buscar turmas:', error)
    }
  }

  useEffect(() => {
    fetchAtividades()
    fetchTurmas()
  }, [])

  const handleAddAtividade = async () => {
    try {
      if (
        !newAtividade.nome ||
        !newAtividade.valor ||
        !newAtividade.data ||
        !newAtividade.turma_id
      ) {
        console.error('Nome, valor, data e turma são obrigatórios.')
        return
      }

      const formattedData = formatDateToISO(newAtividade.data)

      const response = await axios.post(
        'http://129.148.34.197:3000/api/atividade/criarAtividade',
        { ...newAtividade, data: formattedData },
      )
      setData((prevData) => [...prevData, response.data])
      clearAtividade()
      setIsAddPopupOpen(false)
      fetchAtividades()
    } catch (error) {
      console.error('Erro ao cadastrar atividade:', error)
    }
  }

  const handleEditClick = (atividade: Atividade) => {
    setSelectedAtividade(atividade)
    setNewAtividade(atividade)
    setIsEditPopupOpen(true)
  }

  const handleEditAtividade = async () => {
    if (selectedAtividade) {
      try {
        const formattedData = formatDateToISO(newAtividade.data)

        await axios.put(
          `http://129.148.34.197:3000/api/atividade/atualizar/${selectedAtividade.id}`,
          { ...newAtividade, data: formattedData },
        )

        setData((prevData) =>
          prevData.map((a) =>
            a.id === selectedAtividade.id
              ? { ...newAtividade, data: formattedData }
              : a,
          ),
        )
        setIsEditPopupOpen(false)
        clearAtividade()
      } catch (error) {
        console.error('Erro ao editar atividade:', error)
      }
    }
  }

  const handleDeleteClick = (atividade: Atividade) => {
    setSelectedAtividade(atividade)
    setIsDeletePopupOpen(true)
  }

  const handleDeleteAtividade = async () => {
    if (selectedAtividade) {
      try {
        await axios.delete(
          `http://129.148.34.197:3000/api/atividade/deletar/${selectedAtividade.id}`,
        )
        setData((prevData) =>
          prevData.filter((a) => a.id !== selectedAtividade.id),
        )
        setIsDeletePopupOpen(false)
      } catch (error) {
        console.error('Erro ao deletar atividade:', error)
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
          placeholder="Buscar atividade..."
          className="w-1/3"
          onChange={(e) =>
            table.getColumn('nome')?.setFilterValue(e.target.value)
          }
        />
        <Button onClick={() => setIsAddPopupOpen(true)}>
          <CirclePlus />
          Adicionar Atividade
        </Button>
      </div>
      <div className="rounded-md border mt-3">
        {data.length === 0 ? (
          <div className="p-4 text-center">Nenhum dado encontrado.</div>
        ) : (
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                  {/* Coluna de ações */}
                  <TableCell className="flex gap-2">
                    <Button
                      onClick={() => handleEditClick(row.original)}
                      variant="outline"
                      color="primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(row.original)}
                      color="destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Popup para Adicionar Atividade */}
      {isAddPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl mb-4">Adicionar Atividade</h2>
            <div className="mb-4">
              <label htmlFor="nome" className="block text-sm font-medium">
                Nome
              </label>
              <Input
                id="nome"
                value={newAtividade.nome}
                onChange={(e) =>
                  setNewAtividade({ ...newAtividade, nome: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label htmlFor="valor" className="block text-sm font-medium">
                Valor
              </label>
              <Input
                id="valor"
                type="number"
                value={newAtividade.valor}
                onChange={(e) =>
                  setNewAtividade({ ...newAtividade, valor: +e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label htmlFor="data" className="block text-sm font-medium">
                Data
              </label>
              <Input
                id="data"
                type="date"
                value={newAtividade.data}
                onChange={(e) =>
                  setNewAtividade({ ...newAtividade, data: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label htmlFor="turma" className="block text-sm font-medium">
                Turma
              </label>
              <select
                id="turma"
                value={newAtividade.turma_id}
                onChange={(e) =>
                  setNewAtividade({
                    ...newAtividade,
                    turma_id: +e.target.value,
                  })
                }
                className="block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Selecione uma turma</option>
                {turmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => {
                  setIsAddPopupOpen(false)
                  clearAtividade()
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddAtividade}>Adicionar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para Editar Atividade */}
      {isEditPopupOpen && selectedAtividade && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl mb-4">Editar Atividade</h2>
            <div className="mb-4">
              <label htmlFor="nome" className="block text-sm font-medium">
                Nome
              </label>
              <Input
                id="nome"
                value={newAtividade.nome}
                onChange={(e) =>
                  setNewAtividade({ ...newAtividade, nome: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label htmlFor="valor" className="block text-sm font-medium">
                Valor
              </label>
              <Input
                id="valor"
                type="number"
                value={newAtividade.valor}
                onChange={(e) =>
                  setNewAtividade({ ...newAtividade, valor: +e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label htmlFor="data" className="block text-sm font-medium">
                Data
              </label>
              <Input
                id="data"
                type="date"
                value={newAtividade.data}
                onChange={(e) =>
                  setNewAtividade({ ...newAtividade, data: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label htmlFor="turma" className="block text-sm font-medium">
                Turma
              </label>
              <select
                id="turma"
                value={newAtividade.turma_id}
                onChange={(e) =>
                  setNewAtividade({
                    ...newAtividade,
                    turma_id: +e.target.value,
                  })
                }
                className="block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Selecione uma turma</option>
                {turmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => {
                  setIsEditPopupOpen(false)
                  clearAtividade()
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleEditAtividade}>Salvar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para Deletar Atividade */}
      {isDeletePopupOpen && selectedAtividade && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl mb-4">Confirmar Exclusão</h2>
            <p>
              Tem certeza de que deseja excluir a atividade
              {selectedAtividade.nome}?
            </p>
            <div className="flex justify-end gap-4 mt-4">
              <Button onClick={() => setIsDeletePopupOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleDeleteAtividade} variant="destructive">
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
