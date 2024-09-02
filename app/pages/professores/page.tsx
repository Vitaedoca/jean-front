"use client";
import { useEffect, useState } from "react";
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
} from "@tanstack/react-table";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, CirclePlus, X, Edit, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";

export type Professor = {
  id: number;
  nome: string;
  email: string;
  cpf: string;
};

export const columns: ColumnDef<Professor>[] = [
  {
    accessorKey: "nome",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nome
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("nome")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "cpf",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        CPF
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("cpf")}</div>,
  },
  {
    id: "actions",
  },
];

export default function Professores() {
  const [data, setData] = useState<Professor[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(
    null
  );
  const [newProfessor, setNewProfessor] = useState<Professor>({
    id: 0,
    nome: "",
    email: "",
    cpf: "",
  });

  // Defina a função fetchProfessors fora do useEffect
  const fetchProfessors = async () => {
    try {
      const response = await axios.get(
        "http://129.148.34.197:3000/api/professor/listarTodos"
      );
      setData(response.data["data.omitempty"]);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
    }
  };

  useEffect(() => {
    // Chame a função fetchProfessors dentro do useEffect
    fetchProfessors();
  }, []);

  // Limpa o modal
  const clerSetNewProfessor = () => {
    setNewProfessor({
      id: 0,
      nome: "",
      email: "",
      cpf: "",
    });
  };

  const handleAddProfessor = async () => {
    try {
      const response = await axios.post(
        "http://129.148.34.197:3000/api/professor/criarProfessor",
        newProfessor
      );
      setData((prevData) => [...prevData, response.data]);
      setIsAddPopupOpen(false);
      fetchProfessors();
      clerSetNewProfessor();
      return toast.success("Professor Criado com Sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar professor:", error);
    }
    clerSetNewProfessor();
  };

  const handleEditClick = (professor: Professor) => {
    setSelectedProfessor(professor);
    setNewProfessor(professor); // Certifique-se de que newProfessor é uma cópia do professor para edição
    setIsEditPopupOpen(true);
  };

  const handleEditProfessor = async () => {
    if (selectedProfessor) {
      try {
        await axios.put(
          `http://129.148.34.197:3000/api/professor/atualizar/${selectedProfessor.id}`,
          newProfessor
        );
        setData((prevData) =>
          prevData.map((prof) =>
            prof.id === selectedProfessor.id ? newProfessor : prof
          )
        );
        setIsEditPopupOpen(false);
        setNewProfessor({
          id: 0,
          nome: "",
          email: "",
          cpf: "",
        });
        return toast.success("Professor Editado com Sucesso!");
      } catch (error) {
        setIsEditPopupOpen(false);
        return toast.error("Erro ao editar professor:");
      }
    }
    setNewProfessor({
      id: 0,
      nome: "",
      email: "",
      cpf: "",
    });
  };

  const handleDeleteClick = (professor: Professor) => {
    setSelectedProfessor(professor);
    setIsDeletePopupOpen(true);
  };

  const handleDeleteProfessor = async () => {
    if (selectedProfessor) {
      try {
        await axios.delete(
          `http://129.148.34.197:3000/api/professor/deletar/${selectedProfessor.id}`
        );
        setData((prevData) =>
          prevData.filter((prof) => prof.id !== selectedProfessor.id)
        );
        setIsDeletePopupOpen(false);
        return toast.success("Professor Deletado com Sucesso!");
      } catch (error) {
        setIsDeletePopupOpen(false);
        return toast.error("Erro! O professor está associado a uma turma.");
      }
    }
  };

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
  });

  return (
    <div className="w-full">
      <div className="flex justify-between py-4">
        <Input
          placeholder="Filtrar nomes..."
          value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("nome")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button onClick={() => setIsAddPopupOpen(true)}>
          <CirclePlus />
          Adicionar Professor
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
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                      {/* Aqui é onde os botões serão adicionados */}
                      {cell.column.id === "actions" && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleEditClick(row.original)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={"destructive"}
                            onClick={() => handleDeleteClick(row.original)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isAddPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Adicionar Professor</h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddPopupOpen(false);
                  clerSetNewProfessor();
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Nome"
                value={newProfessor.nome}
                onChange={(e) =>
                  setNewProfessor({ ...newProfessor, nome: e.target.value })
                }
              />
              <Input
                type="email"
                placeholder="Email"
                value={newProfessor.email}
                onChange={(e) =>
                  setNewProfessor({ ...newProfessor, email: e.target.value })
                }
              />
              <Input
                placeholder="CPF"
                value={newProfessor.cpf}
                onChange={(e) =>
                  setNewProfessor({ ...newProfessor, cpf: e.target.value })
                }
              />
              <Button onClick={handleAddProfessor}>Adicionar</Button>
            </div>
          </div>
        </div>
      )}

      {isEditPopupOpen && selectedProfessor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Editar Professor</h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditPopupOpen(false);
                  clerSetNewProfessor();
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Nome"
                value={newProfessor.nome}
                onChange={(e) =>
                  setNewProfessor({ ...newProfessor, nome: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                value={newProfessor.email}
                onChange={(e) =>
                  setNewProfessor({ ...newProfessor, email: e.target.value })
                }
              />
              <Input
                placeholder="CPF"
                value={newProfessor.cpf}
                onChange={(e) =>
                  setNewProfessor({ ...newProfessor, cpf: e.target.value })
                }
              />
              <Button onClick={handleEditProfessor}>Salvar</Button>
            </div>
          </div>
        </div>
      )}

      {isDeletePopupOpen && selectedProfessor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Excluir Professor
              </h2>
              <Button
                variant="ghost"
                onClick={() => setIsDeletePopupOpen(false)}
              >
                <X className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
            <p className="text-gray-700 mb-6">
              Tem certeza de que deseja excluir o professor{" "}
              <strong>{selectedProfessor.nome}</strong>?
            </p>
            <div className="flex gap-4">
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDeleteProfessor}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
