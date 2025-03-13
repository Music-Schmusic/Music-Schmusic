import React from 'react';  // Add this import
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from './settings';

// Create a custom render function if needed
const customRender = (ui, options) => {
  return render(ui, { ...options });
};

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the settings page with initial state', () => {
    customRender(React.createElement(SettingsPage));
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
  });

  it('shows account settings by default', () => {
    customRender(React.createElement(SettingsPage));
    
    expect(screen.getByPlaceholderText('Enter new username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter new email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter new password')).toBeInTheDocument();
  });

  it('switches to preferences tab when clicked', async () => {
    customRender(React.createElement(SettingsPage));
    
    const preferencesTab = screen.getByText('Preferences');
    await userEvent.click(preferencesTab);
    
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    expect(screen.getByText('Enable Email Notifications')).toBeInTheDocument();
  });

  it('updates form data when input changes', async () => {
    customRender(React.createElement(SettingsPage));
    
    const usernameInput = screen.getByPlaceholderText('Enter new username');
    const emailInput = screen.getByPlaceholderText('Enter new email');
    
    await userEvent.type(usernameInput, 'newusername');
    await userEvent.type(emailInput, 'newemail@test.com');
    
    expect(usernameInput.value).toBe('newusername');
    expect(emailInput.value).toBe('newemail@test.com');
  });

  it('handles form submission', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    customRender(React.createElement(SettingsPage));
    
    await userEvent.type(screen.getByPlaceholderText('Enter new username'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('Enter new email'), 'test@example.com');
    
    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Settings saved', expect.objectContaining({
      username: 'testuser',
      email: 'test@example.com'
    }));
  });

  it('toggles notification checkbox in preferences', async () => {
    customRender(React.createElement(SettingsPage));
    
    await userEvent.click(screen.getByText('Preferences'));
    
    const notificationCheckbox = screen.getByRole('checkbox');
    await userEvent.click(notificationCheckbox);
    
    expect(notificationCheckbox.checked).toBe(false);
  });

  it('handles cancel button click', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    customRender(React.createElement(SettingsPage));
    
    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Cancelled');
  });

  it('maintains form state when switching tabs', async () => {
    customRender(React.createElement(SettingsPage));
    
    await userEvent.type(screen.getByPlaceholderText('Enter new username'), 'testuser');
    await userEvent.click(screen.getByText('Preferences'));
    await userEvent.click(screen.getByText('Account'));
    
    expect(screen.getByPlaceholderText('Enter new username')).toHaveValue('testuser');
  });

  it('applies correct styling to active tab', () => {
    customRender(React.createElement(SettingsPage));
    
    expect(screen.getByText('Account').className).toContain('accent-button');
    expect(screen.getByText('Preferences').className).not.toContain('accent-button');
  });
});