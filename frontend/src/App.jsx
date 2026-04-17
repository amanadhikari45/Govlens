import React from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import MainLayout from './components/MainLayout';

export default function App() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MainLayout /> : <LoginPage />;
}
