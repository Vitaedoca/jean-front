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

// Types
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
]

export default function Notas() {
  const [data, setData] = useState<Turma[]>([])
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null)
  const [selectedNota, setSelectedNota] = useState<Turma | null>(null)
  const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(
    null,
  )

  // Fetch Turmas
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

  // Fetch Atividades for Selected Turma
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

  // Fetch Alunos for Selected Atividade
  useEffect(() => {
    // if (selectedAtividade) {
    const fetchAlunos = async () => {
      try {
        const idTurma = selectedTurma?.id
        console.log(idTurma)
        const response = await axios.get(
          `http://129.148.34.197:3000/api/turma/listar/${idTurma}`,
        )
        // console.log(response.data['data.omitempty'].alunos)
        setAlunos(response.data['data.omitempty'].alunos)
        console.log(alunos)
      } catch (error) {
        console.error('Erro ao buscar alunos:', error)
      }
    }
    fetchAlunos()
    // } else {
    //   setAlunos([])
    // }
  }, [selectedAtividade])

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
              onClick={() => setSelectedTurma(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTurma(row.original)}
                >
                  Ver Atividades
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedTurma && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">Atividades da Turma</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atividades.map((atividade) => (
                <TableRow key={atividade.id}>
                  <TableCell>{atividade.nome}</TableCell>
                  <TableCell>{atividade.valor}</TableCell>
                  <TableCell>{atividade.data}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedNota(selectedTurma.id)}
                    >
                      Ver Alunos
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedNota && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">Alunos da Atividade</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alunos.map((aluno) => (
                <TableRow key={aluno.id}>
                  <TableCell>{aluno.nome}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      // onClick={() => setSelectedNota(aluno)}
                    >
                      Passar nota
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
