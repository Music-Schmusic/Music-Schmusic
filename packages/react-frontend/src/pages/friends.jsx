import React, { useState } from 'react';

const friendData = [
  { id: 1, name: "Alice", status: "Listening", avatar: 'pfp.png' },
  { id: 2, name: "Bob", status: "Inactive", avatar: 'pfp.png' },
  { id: 3, name: "Charlie", status: "Inactive", avatar: 'pfp.png' },
  { id: 4, name: "Dave", status: "Listening", avatar: 'pfp.png' },
  { id: 5, name: "Eve", status: "Listening", avatar: 'pfp.png' },
  { id: 6, name: "Frank", status: "Inactive", avatar: 'pfp.png' },
];

export default function FriendsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredFriends = friendData.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || friend.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case "Listening":
        return "#30e849";
      case "Inactive":
        return "orange";
    }
  };

  const handleAddFriend = () => {
    console.log("Add New Friends button clicked");
  };


  return (
    <div className="friends-page">
      <h1>Connect with Friends</h1>
      <button 
        className="add-friend-button" 
        onClick={handleAddFriend}
        style={{
          marginBottom: '20px',
          padding: '10px 74px',
          backgroundColor: '#30e849',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Add New Friends   + 
      </button>
      {/* Search and Filter Controls */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search friends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ backgroundColor: 'white' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ backgroundColor: 'white' }}
        >
          <option value="All">All</option>
          <option value="Listening">Listening</option>
          <option value="Inactive">Busy</option>
        </select>
      </div>

      {/* Friend Cards */}
      <div className="friends-grid">
        {filteredFriends.map(friend => (
          <div key={friend.id} className="friend-card">
            <img src={friend.avatar} alt={friend.name} />
            <div style={{ flex: "1" }}>
              <h3>{friend.name}</h3>
              <p style={{ color: getStatusColor(friend.status) }}>{friend.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}