"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, UserRole, AuthState, LegacyUserRole } from "@/lib/types";
import { api } from "@/services/api";
import type { Usuario as ApiUser } from "@/services/api";
import { useError } from "@/contexts/error-context";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (roles: Array<UserRole | LegacyUserRole>) => boolean;
  users: User[];
  addUser: (user: Omit<User, "id" | "createdAt"> & { password: string }) => Promise<void>;
  updateUser: (id: string, user: Partial<User> & { password?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleMap: Record<UserRole, LegacyUserRole> = {
  admin: "administrador",
  supervisor: "supervisor",
  operator: "operario",
  quality: "calidad",
};

const apiRoleToFront: Record<string, UserRole> = {
  administrador: "admin",
  supervisor: "supervisor",
  operario: "operator",
  control_calidad: "quality",
};

const frontRoleToApi: Record<UserRole, string> = {
  admin: "administrador",
  supervisor: "supervisor",
  operator: "operario",
  quality: "control_calidad",
};

const apiDeptToFront: Record<string, string> = {
  produccion: "Producción",
  calidad: "Calidad",
  recepcion: "Recepción",
  clasificacion: "Clasificación",
  seleccion: "Selección",
  empaque: "Empaque",
  distribucion: "Distribución",
  administracion: "Administración",
};

const frontDeptToApi: Record<string, string> = {
  "Producción": "produccion",
  "Produccion": "produccion",
  "Calidad": "calidad",
  "Recepción": "recepcion",
  "Recepcion": "recepcion",
  "Clasificación": "clasificacion",
  "Clasificacion": "clasificacion",
  "Selección": "seleccion",
  "Seleccion": "seleccion",
  "Empaque": "empaque",
  "Distribución": "distribucion",
  "Distribucion": "distribucion",
  "Administración": "administracion",
  "Administracion": "administracion",
  // Also handle lowercase API values in case the form uses them
  produccion: "produccion",
  calidad: "calidad",
  recepcion: "recepcion",
  clasificacion: "clasificacion",
  seleccion: "seleccion",
  empaque: "empaque",
  distribucion: "distribucion",
  administracion: "administracion",
};

const apiStatusToFront: Record<string, "active" | "inactive"> = {
  activo: "active",
  inactivo: "inactive",
};

const frontStatusToApi: Record<string, string> = {
  active: "activo",
  inactive: "inactivo",
};

const normalizeRole = (role: UserRole | LegacyUserRole): UserRole => {
  switch (role) {
    case "administrador":
      return "admin";
    case "operario":
      return "operator";
    case "calidad":
      return "quality";
    default:
      return role;
  }
};

// Convertir usuario de API a formato frontend
const apiUserToUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.id.toString(),
    name: apiUser.nombre_completo,
    nombre: apiUser.nombre_completo,
    username: apiUser.username,
    email: apiUser.email,
    phone: apiUser.telefono,
    role: apiRoleToFront[apiUser.rol],
    rol: apiUser.rol,
    department: apiDeptToFront[apiUser.departamento] || apiUser.departamento,
    status: apiStatusToFront[apiUser.estado],
    active: apiUser.estado === "activo",
    createdAt: apiUser.fecha_creacion,
    lastAccess: new Date().toISOString(),
  };
};

const withLegacyUser = (user: User): User => ({
  ...user,
  nombre: user.name,
  rol: roleMap[user.role],
});

const safeLocalStorage = {
  getItem: (key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [users, setUsers] = useState<User[]>([]);
  const { showWarning, showError } = useError();

  // Cargar usuarios desde el API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.getUsuarios();
        const mappedUsers = response.results.map(apiUserToUser);
        setUsers(mappedUsers);
      } catch (error) {
          console.error("Error loading users:", error);
          showError(
            "Error al cargar usuarios",
            "No se pudieron obtener los usuarios del servidor.",
            error instanceof Error ? error.message : String(error),
          );
        }
    };
    
    if (authState.isAuthenticated) {
      fetchUsers();
    }
  }, [authState.isAuthenticated]);

  // Verificar sesión existente al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = safeLocalStorage.getItem("auth_token");
      if (token) {
        try {
          const apiUser = await api.getCurrentUser();
          const user = apiUserToUser(apiUser);
          setAuthState({ 
            user: withLegacyUser(user), 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          console.error("Session expired:", error);
          showWarning(
            "Sesión expirada",
            "Tu sesión anterior no es válida. Por favor iniciá sesión nuevamente.",
            error instanceof Error ? error.message : String(error),
          );
          safeLocalStorage.removeItem("auth_token");
          setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (
    emailOrUsername: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const response = await api.login(emailOrUsername, password);
      const user = apiUserToUser(response.user);
      const resolvedUser = withLegacyUser(user);
      
      setAuthState({
        user: resolvedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  };

  const hasPermission = (roles: Array<UserRole | LegacyUserRole>): boolean => {
    if (!authState.user) return false;
    return roles.map(normalizeRole).includes(authState.user.role);
  };

  const addUser = async (userData: Omit<User, "id" | "createdAt"> & { password: string }) => {
    try {
      const apiData = {
        username: userData.username || userData.email.split('@')[0],
        email: userData.email,
        nombres: userData.name.split(' ')[0],
        apellidos: userData.name.split(' ').slice(1).join(' '),
        telefono: userData.phone,
        rol: frontRoleToApi[userData.role],
        departamento: frontDeptToApi[userData.department] || userData.department,
        estado: frontStatusToApi[userData.status || 'active'],
        password: userData.password,
      };
      
      const createdUser = await api.createUsuario(apiData);
      const newUser = apiUserToUser(createdUser);
      setUsers((prev) => [...prev, newUser]);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<User> & { password?: string }) => {
    try {
      const apiData: any = {};
      if (userData.name) {
        apiData.nombres = userData.name.split(' ')[0];
        apiData.apellidos = userData.name.split(' ').slice(1).join(' ');
      }
      if (userData.email) apiData.email = userData.email;
      if (userData.phone) apiData.telefono = userData.phone;
      if (userData.role) {
        apiData.rol = frontRoleToApi[userData.role];
      }
      if (userData.department) {
        apiData.departamento = frontDeptToApi[userData.department] || userData.department;
      }
      if (userData.status) {
        apiData.estado = frontStatusToApi[userData.status];
      }
      if (userData.username) {
        apiData.username = userData.username;
      }
      if (userData.password) {
        apiData.password = userData.password;
      }
      
      const updatedUser = await api.updateUsuario(parseInt(id), apiData);
      const user = apiUserToUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === id ? user : u)));
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.deleteUsuario(parseInt(id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        hasPermission,
        users,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}
