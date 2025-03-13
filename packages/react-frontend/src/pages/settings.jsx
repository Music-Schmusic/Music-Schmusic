import React, { useState } from 'react';

export default function SettingsPage() {
  // Active tab state: "account" or "preferences"
  const [activeTab, setActiveTab] = useState("account");

  // Form data state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    notifications: true,
  });

  // Generic change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Settings saved", formData);
  };

  return (
    <div style={{
        backgroundColor: '#1e1e1e',
        //minHeight: '100vh',
        width: '100vw',     // Ensures full width
        display: 'flex',
        //justifyContent: 'center',
        //alignItems: 'center',
        //color: 'white',
        ///margin: 0,          // Make sure there's no default margin
        //padding: 0,
        position: 'relative'
      }}>
    <div className="container content-section">
      <h1>Settings</h1>
      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button 
          className={`button ${activeTab === "account" ? "accent-button" : ""}`}
          onClick={() => setActiveTab("account")}
        >
          Account
        </button>
        <button 
          className={`button ${activeTab === "preferences" ? "accent-button" : ""}`}
          onClick={() => setActiveTab("preferences")}
        >
          Preferences
        </button>
      </div>
      <form onSubmit={handleSubmit} className="form">
        {activeTab === "account" && (
          <div className="form-section">
            <label>
              Username:
              <input 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                placeholder="Enter new username" 
                style={{ color: 'white' }}
              />
            </label>
            <label>
              Email:
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Enter new email" 
                style={{ color: 'white' }}
              />
            </label>
            <label>
              Password:
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Enter new password" 
                style={{ color: 'white' }}
              />
            </label>
          </div>
        )}
        {activeTab === "preferences" && (
          <div className="form-section">
            <div class="dropdown">
            <button class="dropbtn">Theme</button>
            <div class="dropdown-content">
              <a href="#">Light</a>
              <a href="#">Dark</a>
            </div>
          </div>
          <div class="dropdown2">
            <button class="dropbtn2">Privacy Settings</button>
            <div class="dropdown2-content">
              <a href="#">Private</a>
              <a href="#">Public</a>
            </div>
          </div>
            <label>
              <input 
                type="checkbox" 
                name="notifications" 
                checked={formData.notifications} 
                onChange={handleChange} 
              />
              Enable Email Notifications
            </label>
          </div>
        )}
        {/* Action Buttons */}
        <div className="form-actions" style={{ marginTop: '20px', marginRight:'20px' }}>
          <button 
            type="button" 
            className="button muted-button" 
            onClick={() => console.log("Cancelled")}
          >
            Cancel
          </button>
          <button type="submit" className="button">
            Save
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}

