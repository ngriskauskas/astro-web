import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "../utils/api";

interface Friend {
  id: number;
  username: string;
  status?: "pending" | "accepted";
}

interface FriendRequest {
  id: number;
  user_username: string;
  friend_username: string;
  created: string;
}

interface FriendsContextType {
  friends: Friend[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  searchResults: Friend[];
  fetchFriends: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  sendRequest: (id: number) => Promise<void>;
  acceptRequest: (id: number) => Promise<void>;
  declineRequest: (id: number) => Promise<void>;
  blockUser: (id: number) => Promise<void>;
  removeFriend: (id: number) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  cancelRequest: (id: number) => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);

  const fetchFriends = async () => {
    const data = await apiFetch("/users/me/friends");
    setFriends(data.friends || []);
  };

  const fetchRequests = async () => {
    const data = await apiFetch("/users/me/friend_requests");
    setIncomingRequests(data.incoming || []);
    setOutgoingRequests(data.outgoing || []);
  };

  const sendRequest = async (id: number) => {
    await apiFetch(`/users/${id}/friend_request`, { method: "POST" });
    await fetchRequests();
  };

  const acceptRequest = async (id: number) => {
    await apiFetch(`/users/${id}/accept`, { method: "POST" });
    await Promise.all([fetchFriends(), fetchRequests()]);
  };

  const declineRequest = async (id: number) => {
    await apiFetch(`/users/${id}/reject`, { method: "POST" });
    await fetchRequests();
  };

  const removeFriend = async (id: number) => {
    await apiFetch(`/users/${id}/remove_friend`, { method: "POST" });
    await Promise.all([fetchFriends(), fetchRequests()]);
  };

  const blockUser = async (id: number) => {
    await apiFetch(`/users/${id}/block`, { method: "POST" });
    await Promise.all([fetchFriends(), fetchRequests()]);
  };

  const searchUsers = async (query: string) => {
    const data = await apiFetch(`/users/search?q=${encodeURIComponent(query)}`);
    setSearchResults(data.results || []);
  };

  const cancelRequest = async (id: number) => {
    await apiFetch(`/users/${id}/cancel_request`, { method: "POST" });
    await fetchRequests();
  };

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  return (
    <FriendsContext.Provider
      value={{
        friends,
        incomingRequests,
        outgoingRequests,
        searchResults,
        fetchFriends,
        fetchRequests,
        sendRequest,
        acceptRequest,
        declineRequest,
        blockUser,
        removeFriend,
        searchUsers,
        cancelRequest,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error("useFriends must be used within a FriendsProvider");
  return ctx;
};
