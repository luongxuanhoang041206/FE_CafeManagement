"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { hasPermission } from "@/lib/auth/types"
import type { Employee } from "@/lib/admin-employees-api"
import {
  deleteEmployeeById,
  fetchEmployeesFromApi,
  saveEmployee,
} from "@/lib/admin-employees-api"
import { PermissionGuard } from "@/components/permission-guard"
import { EmployeeModal } from "@/components/employee-modal"
import { EmployeeDrawer } from "@/components/employee-drawer"
import { DeleteConfirm } from "@/components/delete-confirm"
import { TablePagination } from "@/components/table-pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react"

const ITEMS_PER_PAGE = 6

export function EmployeeTable() {
  const { user } = useAuth()
  const [sortOption, setSortOption] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    setLoading(true)
    let sortBy = "id"
    let direction = "asc"
    if (sortOption === "salary_desc") {
      sortBy = "salary"
      direction = "desc"
    } else if (sortOption === "salary_asc") {
      sortBy = "salary"
      direction = "asc"
    } else if (sortOption === "name_asc") {
      sortBy = "name"
      direction = "asc"
    } else if (sortOption === "name_desc") {
      sortBy = "name"
      direction = "desc"
    }

    fetchEmployeesFromApi(
      currentPage - 1,
      ITEMS_PER_PAGE,
      sortBy,
      direction,
      search || undefined
    )
      .then((data) => {
        setEmployees(data.content)
        setTotalPages(data.totalPages)
        setTotalItems(data.totalElements)
      })
      .catch((error) => {
        console.error("Failed to load employees", error)
        setEmployees([])
        setTotalPages(0)
        setTotalItems(0)
      })
      .finally(() => setLoading(false))
  }, [currentPage, sortOption, search])

  const handleSave = useCallback(async (employee: Employee) => {
    try {
      await saveEmployee(employee)
      setCurrentPage(1)
    } catch (error) {
      console.error("Failed to save employee", error)
    }
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deletingEmployee) return
    try {
      await deleteEmployeeById(deletingEmployee.id)
      setDeleteOpen(false)
      setDeletingEmployee(null)
      setCurrentPage(1)
    } catch (error) {
      console.error("Failed to delete employee", error)
    }
  }, [deletingEmployee])

  const canEdit = user ? hasPermission(user.role, "edit:employees") : false
  const canDelete = user ? hasPermission(user.role, "delete:employees") : false

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={sortOption}
            onValueChange={(v) => {
              setCurrentPage(1)
              setSortOption(v)
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salary_desc">Salary (high to low)</SelectItem>
              <SelectItem value="salary_asc">Salary (low to high)</SelectItem>
              <SelectItem value="name_asc">Name A–Z</SelectItem>
              <SelectItem value="name_desc">Name Z–A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <PermissionGuard roles={["ADMIN"]}>
          <Button
            onClick={() => {
              setEditingEmployee(null)
              setModalOpen(true)
            }}
          >
            <Plus className="size-4" />
            Add Employee
          </Button>
        </PermissionGuard>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Salary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center"
                >
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.phone || "—"}</TableCell>
                  <TableCell className="text-right">
                    {employee.salary || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setViewingEmployee(employee)
                            setDrawerOpen(true)
                          }}
                        >
                          <Eye className="mr-2 size-4" />
                          Detail
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingEmployee(employee)
                              setModalOpen(true)
                            }}
                          >
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setDeletingEmployee(employee)
                              setDeleteOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && (
          <div className="border-t">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <EmployeeModal
        employee={editingEmployee}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={(e) => void handleSave(e)}
      />

      <EmployeeDrawer
        employee={viewingEmployee}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => void handleDelete()}
        productName={deletingEmployee?.name ?? ""}
        title="Delete Employee"
      />
    </div>
  )
}
