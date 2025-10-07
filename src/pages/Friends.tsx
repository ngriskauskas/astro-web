import { useState } from "react";
import { useFriends } from "../contexts/FriendsContext";
import toast from "react-hot-toast";

export const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    searchResults,
    searchUsers,
    sendRequest,
    cancelRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  } = useFriends();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) await searchUsers(searchQuery);
  };

  const handleSendRequest = async (id: number) => {
    try {
      await sendRequest(id);
      toast.success("Friend request sent");
    } catch (err: any) {
      toast.error(err.message || "Failed to send request");
    }
  };

  const handleCancelRequest = async (id: number) => {
    try {
      await cancelRequest(id);
      toast.success("Friend request cancelled");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel request");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Friends</h1>

      {/* Friend Search */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Find Friends</h2>
        <form onSubmit={handleSearch} className="flex space-x-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer"
          >
            Search
          </button>
        </form>

        {searchResults.length > 0 && (
          <ul className="space-y-2">
            {searchResults.map((u) => (
              <li key={u.id} className="flex justify-between items-center">
                <span>{u.username}</span>
                <button
                  onClick={() => handleSendRequest(u.id)}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded cursor-pointer"
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Incoming Requests */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Incoming Requests</h2>
        {incomingRequests.length > 0 ? (
          <ul className="space-y-2">
            {incomingRequests.map((r) => (
              <li key={r.id} className="flex justify-between items-center">
                <span>{r.user_username}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => acceptRequest(r.id)}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => declineRequest(r.id)}
                    className="text-sm bg-gray-400 text-white px-3 py-1 rounded cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No incoming requests</p>
        )}
      </div>

      {/* Outgoing Requests */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Outgoing Requests</h2>
        {outgoingRequests.length > 0 ? (
          <ul className="space-y-2">
            {outgoingRequests.map((r) => (
              <li key={r.id} className="flex justify-between items-center">
                <span>{r.user_username}</span>
                <button
                  onClick={() => handleCancelRequest(r.id)}
                  className="text-sm bg-yellow-600 text-white px-3 py-1 rounded cursor-pointer"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No outgoing requests</p>
        )}
      </div>

      {/* Current Friends */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Your Friends</h2>
        {friends.length > 0 ? (
          <ul className="space-y-2">
            {friends.map((f) => (
              <li key={f.id} className="flex justify-between items-center">
                <span>{f.username}</span>
                <button
                  onClick={() => removeFriend(f.id)}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded cursor-pointer"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No friends yet</p>
        )}
      </div>
    </div>
  );
};
