import { useEffect, useState } from "react";
import API from "../../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch users from the backend
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await API.get("/admin/users");

      const userList = Array.isArray(response.data)
        ? response.data
        : response.data.users || [];

      setUsers(userList);
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load users. Check your admin API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search users by name or email
  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    return (
      user.name?.toLowerCase().includes(searchText) ||
      user.email?.toLowerCase().includes(searchText)
    );
  });

  // Delete selected user
  const handleDelete = async () => {
    if (!selectedUser) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await API.delete(`/admin/users/${selectedUser._id}`);

      setUsers((previousUsers) =>
        previousUsers.filter(
          (user) => user._id !== selectedUser._id
        )
      );

      setSuccess("User deleted successfully.");
      setSelectedUser(null);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete this user."
      );
      setSelectedUser(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-8">
      {/* Page heading */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">All Users</h3>
          <p className="mt-1 text-sm text-gray-500">
            View and manage registered TrendKart customers.
          </p>
        </div>

        <div className="rounded-lg border border-[#e6dfd2] bg-white px-5 py-3">
          <span className="text-sm text-gray-500">
            Total Users{" "}
          </span>
          <span className="font-semibold">{users.length}</span>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <span>{success}</span>
          <button
            onClick={() => setSuccess("")}
            className="text-lg"
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-lg"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mb-5 rounded-xl border border-[#e6dfd2] bg-white p-4">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by customer name or email..."
          className="w-full rounded-lg border border-[#ddd5c8] px-4 py-3 outline-none focus:border-[#211f1b]"
        />
      </div>

      {/* Users table */}
      <div className="overflow-x-auto rounded-xl border border-[#e6dfd2] bg-white shadow-sm">
        {loading ? (
          <p className="p-10 text-center text-gray-500">
            Loading users...
          </p>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="font-semibold">No users found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try another search or check whether customers are registered.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#eee7db] text-gray-700">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Role</th>
                <th className="p-4">Registered</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-[#eee7db] hover:bg-[#fcfbf8]"
                >
                  <td className="p-4">
                    <div className="flex min-w-[180px] items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eee7db] font-semibold text-[#211f1b]">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>

                      <span className="font-medium">
                        {user.name || "Unnamed user"}
                      </span>
                    </div>
                  </td>

                  <td className="p-4">{user.email}</td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {user.role || "user"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap p-4 text-gray-500">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </td>

                  <td className="p-4 text-center">
                    {user.role === "admin" ? (
                      <span className="text-xs text-gray-400">
                        Protected
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedUser(user)}
                        title="Delete user"
                        aria-label={`Delete ${user.name}`}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v5" />
                          <path d="M14 11v5" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Custom delete confirmation modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
              </svg>
            </div>

            <h3
              id="delete-user-title"
              className="text-xl font-semibold"
            >
              Delete Customer?
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#211f1b]">
                {selectedUser.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                disabled={deleting}
                className="rounded-lg border border-[#ddd5c8] px-5 py-2.5 text-sm hover:bg-[#f7f5f0] disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;