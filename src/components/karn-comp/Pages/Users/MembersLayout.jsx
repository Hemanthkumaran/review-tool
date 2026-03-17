import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { X, Clock } from "lucide-react";
import "./MembersLayout.css";
import RemoveAccessModal from "../../../modals/RemoveAccessModal";
import { removeUserFromWorkspace } from "../../../../services/api";
import AppLoader from "../../../common/AppLoader";

export default function MembersLayout({
  onInvite = () => {},
  activeWorkspace,
  fetchWorkspaceUsers,
  workspaceUsers,
  workspacePlan
}) {

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setIsLoading] = useState(false);

  console.log(workspaceUsers, 'workspaceUsers');
  

  const data = useMemo(() => {
    return (workspaceUsers?.permissions || []).map((perm) => ({
      id: perm._id,
      name: perm.name || null,
      email: perm.email,
      role:
        perm.permissionType === "owner"
          ? "Owner"
          : perm.permissionType === "member"
          ? "Team member"
          : "Collaborator",
      pending: !perm.name,
    }));
  }, [workspaceUsers?.permissions]);

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
        cell: ({ getValue }) => (
          <span className="role">{getValue()}</span>
        ),
      },
      {
        header: "Action",
        id: "action",
        cell: ({ row }) =>
          row.original.role !== "Owner" && (
            <button
              className="remove-btn"
              onClick={() => setIsOpen(true)}
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

  /* ---------------------------------------
   * Counts
   * ------------------------------------- */
  const teamCount = data.filter(
    (d) => d.role === "Owner" || d.role === "Team member"
  ).length;

  const collaboratorCount = data.filter(
    (d) => d.role === "Collaborator"
  ).length;
  
  const maxUsers = workspacePlan?.subscription?.maxUsers ?? 1;
  const activePlan = workspacePlan?.subscription?.activePlan;
  const canInvite = teamCount < maxUsers;
  
  async function handleRemove(rowItem) {
    setIsLoading(true);
    const data = {
      "email": rowItem.email
    }
    try {
      const res = await removeUserFromWorkspace(activeWorkspace._id, data);
      fetchWorkspaceUsers();
      setIsOpen(false);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      console.error(e);
    }
  }

  if (loading) return <AppLoader visible={loading} message="Loading folders…" />

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="title">Manage workspace members</h1>
          <p className="subtitle">
            Add or remove teammates and collaborators.
          </p>
        </div>
      </div>

      {/* Members info */}
      <div className="members-bar">
        <div>
          <div className="members-count">{data.length} members</div>
          <div className="members-meta">
            {teamCount} team members · {collaboratorCount} collaborator
          </div>
        </div>

        <button
          className="invite-btn"
          onClick={() => {
            if (!canInvite) {
              alert(
                `Your ${activePlan} plan allows only ${maxUsers} user(s). Please upgrade to add more members.`
              );
              return;
            }
            onInvite();
          }}
          disabled={!canInvite}
          style={!canInvite ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          <span className="plus">+</span>
          Invite
        </button>

        {/* <button className="invite-btn" onClick={onInvite}>
          <span className="plus">+</span>
          Invite
        </button> */}
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
              <>
                            <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
               <RemoveAccessModal
                  open={isOpen}
                  onClose={() => setIsOpen(false)}
                  title={`Remove ${row.original.name} from your workspace?`}
                  description="This user won't be able to view or work in the workspace once removed. You can add them later from Settings → Users."
                  buttonText="Remove from workspace"
                  handleRemove={() => handleRemove(row.original)}
                />
              </>
            ))}
                 
          </tbody>
        </table>
      </div>

    </div>
  );
}
