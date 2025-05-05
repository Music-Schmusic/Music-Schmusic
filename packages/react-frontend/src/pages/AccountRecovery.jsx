import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AccountRecovery() {
  const navigate = useNavigate();

  return (
    <div className="AccountRecovery-page">
      <div className="AccountRecovery-container">
        <h3>TESTING PLEASE WORK</h3>
        <div className="boxes">
          <button
            className="sendemail"
            onClick={() => console.log('YAY')}
          ></button>
        </div>
      </div>
    </div>
  );
}
