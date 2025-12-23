import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { X, Clock } from "lucide-react";
import "./MembersLayout.css";

export default function MembersLayout({ onInvite = () => {} }) {
  const [data, setData] = useState([
    {
      id: 1,
      name: "Vijayaragavan",
      email: "vijayaragavan@gmail.com",
      role: "Owner",
      pending: false,
    },
    {
      id: 2,
      name: "Mia",
      email: "mia@gmail.com",
      role: "Collaborator",
      pending: false,
    },
    {
      id: 3,
      name: "Daniel",
      email: "daniel@gmail.com",
      role: "Team member",
      pending: false,
    },
    {
      id: 4,
      name: "Pending",
      email: "mitchell@gmail.com",
      role: "Collaborator",
      pending: true,
    },
  ]);

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) =>
          row.original.pending ? (
            <span className="pending">
              <Clock size={14} />
              Pending
            </span>
          ) : (
            row.original.name
          ),
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Role",
        accessorKey: "role",
        cell: ({ getValue }) => <span className="role">{getValue()}</span>,
      },
      {
        header: "Action",
        id: "action",
        cell: ({ row }) =>
          row.original.role !== "Owner" && (
            <button
              className="remove-btn"
              onClick={() =>
                setData((prev) =>
                  prev.filter((item) => item.id !== row.original.id)
                )
              }
            >
              Remove
            </button>
          ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="title">Manage workspace members</h1>
          <p className="subtitle">Add or remove teammates and collaborators.</p>
        </div>

        <button className="close-btn">
          <X size={18} />
        </button>
      </div>

      {/* Members info */}
      <div className="members-bar">
        <div>
          <div className="members-count">{data.length} members</div>
          <div className="members-meta">
            {data.filter((d) => d.role !== "Collaborator").length} team members
            · {data.filter((d) => d.role === "Collaborator").length}{" "}
            collaborator
          </div>
        </div>

        <button className="invite-btn" onClick={onInvite}>
          <span className="plus">+</span>
          Invite
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
