"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@/lib/types";
import { api, type Usuario } from "@/services/api";

interface UsersContextType {
  users: User[];
  loading: boolean;
  getUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  getUserByEmail: (email: string) => User | undefined;
  addUser: (user: Omit<User, "id" | "createdAt" | "lastAccess"> & { password: string }) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

// Mapeo de roles del backend al frontend
const roleMap: Record<string, string> = {
  "administrador": "admin",
  "supervisor": "supervisor",
  "operario": "operator",
  "control_calidad": "quality",
};

// Función para convertir Usuario del backend a User del frontend
const convertUsuarioToUser = (usuario: Usuario): User => {
  return {
    id: usuario.id.toString(),
    name: usuario.nombre_completo,
    email: usuario.email,
    role: (roleMap[usuario.rol] || "operator") as "admin" | "supervisor" | "operator" | "quality",
    department: usuario.departamento,
    active: usuario.estado === 'activo',
    createdAt: new Date(usuario.fecha_creacion),
    lastAccess: new Date(usuario.fecha_actualizacion),
  };
};

// Función para convertir User del frontend a Usuario del backend
const convertUserToUsuario = (user: Partial<User>): Partial<Usuario> => {
  const nombres = user.name ? user.name.split(' ')[0] : '';
  const apellidos = user.name ? user.name.split(' ').slice(1).join(' ') : '';
  
  return {
    email: user.email,
    nombres,
    apellidos,
    rol: user.role === 'admin' ? 'administrador' : user.role === 'quality' ? 'control_calidad' : user.role || 'operario',
    departamento: user.department,
    estado: user.active ? 'activo' : 'inactivo',
  };
};

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar usuarios del backend al montar
  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getUsuarios();
      const convertedUsers = response.results.map(convertUsuarioToUser);
      setUsers(convertedUsers);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getUsers = (): User[] => {
    return users;
  };

  const getUserById = (id: string): User | undefined => {
    return users.find((u) => u.id === id);
  };

  const getUserByEmail = (email: string): User | undefined => {
    return users.find((u) => u.email === email);
  };

  const addUser = async (user: Omit<User, "id" | "createdAt" | "lastAccess"> & { password: string }) => {
    try {
      const nombres = user.name.split(' ')[0];
      const apellidos = user.name.split(' ').slice(1).join(' ');
      
      const usuarioData = {
        username: user.email.split('@')[0], // Usar parte del email como username
        email: user.email,
        nombres,
        apellidos,
        telefono: '',
        rol: user.role === 'admin' ? 'administrador' : user.role === 'quality' ? 'control_calidad' : user.role || 'operario',
        departamento: user.department,
        estado: 'activo' as const,
        password: user.password,
      };

      await api.createUsuario(usuarioData);
      await refreshUsers();
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const backendData = convertUserToUsuario(userData);
      await api.updateUsuario(parseInt(id), backendData);
      await refreshUsers();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.deleteUsuario(parseInt(id));
      await refreshUsers();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  };

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        getUsers,
        getUserById,
        getUserByEmail,
        addUser,
        updateUser,
        deleteUser,
        refreshUsers,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}
