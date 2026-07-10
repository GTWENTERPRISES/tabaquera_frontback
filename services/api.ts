/**
 * Servicio de API para comunicación con el backend Django
 * 
 * Este archivo provee funciones para interactuar con todos los endpoints del backend.
 * Maneja autenticación con tokens, errores y transformación de datos.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Tipos de respuesta del API
interface ApiResponse<T> {
  data: T;
  status: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

type ApiErrorPayload =
  | { detail?: string; message?: string; [key: string]: unknown }
  | string
  | string[];

interface LoginResponse {
  token: string;
  session_token?: string;
  user: Usuario;
  requires_2fa?: boolean;
  message?: string;
}

// Interfaces de modelos
export interface Usuario {
  id: number;
  username: string;
  email: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  telefono: string;
  rol: 'administrador' | 'supervisor' | 'operario' | 'control_calidad';
  departamento: string;
  estado: 'activo' | 'inactivo';
  is_active: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  two_factor_enabled: boolean;
}

export interface Sesion {
  id: string;
  usuario: number;
  usuario_nombre: string;
  dispositivo: string;
  navegador: string;
  ip: string;
  ubicacion?: string;
  es_actual: boolean;
  fecha_creacion: string;
  ultima_actividad: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
  rfc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estado: 'activo' | 'inactivo';
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface VariedadTabaco {
  id: number;
  nombre: string;
  descripcion?: string;
  caracteristicas?: string;
  activo: boolean;
}

export interface EtapaProductiva {
  id: number;
  nombre: string;
  orden: number;
  descripcion?: string;
  tiempo_esperado_horas: number;
  activa: boolean;
}

export interface Lote {
  id: number;
  codigo: string;
  codigo_qr: string;
  proveedor: Proveedor | number;
  proveedor_nombre?: string;
  variedad: VariedadTabaco | number;
  variedad_nombre?: string;
  origen: string;
  peso_inicial_kg: number;
  peso_actual_kg: number;
  cantidad_bultos: number;
  estado: 'pendiente' | 'en_espera' | 'en_produccion' | 'finalizado' | 'rechazado';
  etapa_actual?: EtapaProductiva | number;
  etapa_actual_nombre?: string;
  responsable_actual?: Usuario | number;
  responsable_nombre?: string;
  fecha_ingreso: string;
  fecha_inicio_produccion?: string;
  fecha_finalizacion?: string;
  observaciones_iniciales?: string;
  creado_por?: Usuario;
  fecha_creacion: string;
  fecha_actualizacion: string;
  movimientos?: MovimientoLote[];
  inspecciones?: InspeccionCalidad[];
  observaciones?: Observacion[];
  alertas?: Alerta[];
}

export interface MovimientoLote {
  id: number;
  lote: number;
  etapa_origen?: number;
  etapa_origen_nombre?: string;
  etapa_destino?: number;
  etapa_destino_nombre?: string;
  usuario?: number;
  usuario_nombre?: string;
  tipo_movimiento: 'inicio' | 'pausa' | 'reanudacion' | 'finalizacion' | 'reasignacion';
  fecha_hora: string;
  cantidad_procesada_kg?: number;
  tiempo_trabajo_minutos?: number;
  tiempo_pausa_minutos?: number;
  incidencias: 'ninguna' | 'humedad' | 'danos' | 'retraso' | 'otro';
  motivo_retraso: 'ninguno' | 'maquinaria' | 'personal' | 'materia_prima' | 'calidad' | 'otro';
  observaciones?: string;
}

export interface InspeccionCalidad {
  id: number;
  lote: number;
  etapa: number;
  etapa_nombre?: string;
  inspector?: number;
  inspector_nombre?: string;
  estado_calidad: 'pendiente' | 'en_inspeccion' | 'aprobado' | 'aprobado_con_observaciones' | 'rechazado';
  grado_calidad?: 'A' | 'B' | 'C' | 'D';
  temperatura?: number;
  humedad?: number;
  peso_kg?: number;
  humedad_correcta: boolean;
  temperatura_correcta: boolean;
  peso_correcto: boolean;
  embalaje_correcto: boolean;
  etiquetado_correcto: boolean;
  qr_legible: boolean;
  qr_verificado: boolean;
  decision?: 'aprobar' | 'rechazar' | 'solicitar_correccion' | 'solicitar_reinspeccion';
  motivo_rechazo: 'ninguno' | 'humedad_excesiva' | 'danos_fisicos' | 'peso_incorrecto' | 'contaminacion' | 'mala_clasificacion' | 'otro';
  observaciones?: string;
  fecha_hora_inicio: string;
  fecha_hora_fin?: string;
  duracion_minutos?: number;
  evidencias?: EvidenciaCalidad[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface EvidenciaCalidad {
  id: number;
  inspeccion: number;
  tipo: 'foto' | 'documento';
  archivo: string;
  descripcion?: string;
  fecha_subida: string;
}

export interface Observacion {
  id: number;
  lote: number;
  usuario?: number;
  usuario_nombre?: string;
  tipo: 'general' | 'alerta' | 'incidencia' | 'nota';
  contenido: string;
  fecha_hora: string;
}

export interface Alerta {
  id: number;
  lote?: number;
  lote_codigo?: string;
  etapa?: number;
  etapa_nombre?: string;
  tipo: 'retraso' | 'cuello_botella' | 'calidad_rechazada' | 'sistema';
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'activa' | 'resuelta' | 'ignorada';
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
  fecha_resolucion?: string;
  resuelto_por?: number;
  resuelto_por_nombre?: string;
}

export interface EventoSistema {
  id: number;
  tipo: string;
  usuario?: number;
  usuario_nombre?: string;
  lote?: number;
  lote_codigo?: string;
  descripcion: string;
  datos_adicionales?: any;
  fecha_hora: string;
  ip_address?: string;
}

export interface Estadisticas {
  lotes_activos: number;
  lotes_pendientes: number;
  lotes_completados: number;
  lotes_retrasados: number;
  lotes_en_calidad: number;
  inspecciones_pendientes: number;
  inspecciones_aprobadas: number;
  inspecciones_rechazadas: number;
  alertas_activas: number;
  peso_total_kg: number;
}

export interface Trazabilidad {
  lote: Lote;
  timeline: TimelineItem[];
  tiempo_total_minutos: number;
  tiempo_por_etapa: { [key: string]: number };
}

export interface TimelineItem {
  tipo: 'movimiento' | 'inspeccion' | 'observacion';
  fecha: string;
  titulo: string;
  descripcion?: string;
  usuario?: string;
  etapa_origen?: string;
  etapa_destino?: string;
  datos: any;
}

export interface NotificacionData {
  id: number;
  usuario: number;
  usuario_nombre: string;
  lote?: number;
  lote_codigo_display?: string;
  tipo: 'info' | 'warning' | 'critical';
  categoria: string;
  titulo: string;
  mensaje: string;
  url_accion: string;
  leida: boolean;
  fecha_creacion: string;
}

export interface ConfiguracionData {
  id: string;
  clave: string;
  valor: string;
  descripcion: string;
  fecha_actualizacion: string;
}

// Clase de servicio API
class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Cargar token del localStorage si existe
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Error desconocido" })) as ApiErrorPayload;
      throw new Error(this.getErrorMessage(error, response.status));
    }

    return response.json();
  }

  private getErrorMessage(error: ApiErrorPayload, status: number): string {
    if (typeof error === "string") {
      return error;
    }

    if (Array.isArray(error)) {
      return error.join(", ");
    }

    if (error.detail || error.message) {
      return String(error.detail || error.message);
    }

    for (const [field, value] of Object.entries(error)) {
      if (Array.isArray(value) && value.length > 0) {
        return `${field}: ${value.join(", ")}`;
      }

      if (typeof value === "string" && value.trim()) {
        return `${field}: ${value}`;
      }
    }

    return `Error ${status}`;
  }

  async getAllPaginated<T>(path: string, params?: URLSearchParams): Promise<T[]> {
    const results: T[] = [];
    let nextUrl: string | null = params
      ? `${this.baseUrl}${path}?${params.toString()}`
      : `${this.baseUrl}${path}`;

    while (nextUrl) {
      const response = await fetch(nextUrl, { headers: this.getHeaders() });
      const data = await this.handleResponse<PaginatedResponse<T>>(response);
      results.push(...data.results);
      nextUrl = data.next;
    }

    return results;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  // ==================== AUTENTICACIÓN ====================

  async login(username: string, password: string, code?: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, code }),
    });

    const data = await this.handleResponse<LoginResponse>(response);
    if (data.token) {
      this.setToken(data.token);
      if (data.session_token && typeof window !== 'undefined') {
        localStorage.setItem('session_token', data.session_token);
      }
    }
    return data;
  }

  async logout(): Promise<void> {
    const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    await fetch(`${this.baseUrl}/auth/logout/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ session_token: sessionToken }),
    });
    this.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('session_token');
    }
  }

  async getCurrentUser(): Promise<Usuario> {
    const response = await fetch(`${this.baseUrl}/auth/me/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Usuario>(response);
  }

  async toggle2FA(enabled: boolean): Promise<{ two_factor_enabled: boolean }> {
    const response = await fetch(`${this.baseUrl}/auth/toggle_2fa/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ enabled }),
    });
    return this.handleResponse<{ two_factor_enabled: boolean }>(response);
  }

  async send2FACode(): Promise<{ detail: string }> {
    const response = await fetch(`${this.baseUrl}/auth/send_2fa_code/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ detail: string }>(response);
  }

  // ==================== SESIONES ====================

  async getSesiones(): Promise<PaginatedResponse<Sesion>> {
    const response = await fetch(`${this.baseUrl}/sesiones/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<PaginatedResponse<Sesion>>(response);
  }

  async getAllSesiones(): Promise<Sesion[]> {
    return this.getAllPaginated<Sesion>('/sesiones/');
  }

  async terminarSesion(id: string): Promise<{ detail: string }> {
    const response = await fetch(`${this.baseUrl}/sesiones/${id}/terminate/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ detail: string }>(response);
  }

  async terminarOtrasSesiones(): Promise<{ detail: string }> {
    const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    const response = await fetch(`${this.baseUrl}/sesiones/terminate_other/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ session_token: sessionToken }),
    });
    return this.handleResponse<{ detail: string }>(response);
  }

  // ==================== USUARIOS ====================

  async getUsuarios(params?: URLSearchParams): Promise<PaginatedResponse<Usuario>> {
    const url = params ? `${this.baseUrl}/usuarios/?${params}` : `${this.baseUrl}/usuarios/`;
    const response = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<Usuario>>(response);
  }

  async getUsuario(id: number): Promise<Usuario> {
    const response = await fetch(`${this.baseUrl}/usuarios/${id}/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Usuario>(response);
  }

  async createUsuario(data: Partial<Usuario> & { password: string }): Promise<Usuario> {
    const response = await fetch(`${this.baseUrl}/usuarios/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Usuario>(response);
  }

  async updateUsuario(id: number, data: Partial<Usuario>): Promise<Usuario> {
    const response = await fetch(`${this.baseUrl}/usuarios/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Usuario>(response);
  }

  async deleteUsuario(id: number): Promise<void> {
    await fetch(`${this.baseUrl}/usuarios/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  // ==================== PROVEEDORES ====================

  async getProveedores(params?: URLSearchParams): Promise<PaginatedResponse<Proveedor>> {
    const url = params ? `${this.baseUrl}/proveedores/?${params}` : `${this.baseUrl}/proveedores/`;
    const response = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<Proveedor>>(response);
  }

  async getAllProveedores(params?: URLSearchParams): Promise<Proveedor[]> {
    return this.getAllPaginated<Proveedor>('/proveedores/', params);
  }

  async getProveedor(id: number): Promise<Proveedor> {
    const response = await fetch(`${this.baseUrl}/proveedores/${id}/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Proveedor>(response);
  }

  async createProveedor(data: Partial<Proveedor>): Promise<Proveedor> {
    const response = await fetch(`${this.baseUrl}/proveedores/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Proveedor>(response);
  }

  async updateProveedor(id: number, data: Partial<Proveedor>): Promise<Proveedor> {
    const response = await fetch(`${this.baseUrl}/proveedores/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Proveedor>(response);
  }

  async deleteProveedor(id: number): Promise<void> {
    await fetch(`${this.baseUrl}/proveedores/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  // ==================== VARIEDADES DE TABACO ====================

  async getVariedadesTabaco(): Promise<PaginatedResponse<VariedadTabaco>> {
    const response = await fetch(`${this.baseUrl}/variedades-tabaco/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<PaginatedResponse<VariedadTabaco>>(response);
  }

  async getAllVariedadesTabaco(): Promise<VariedadTabaco[]> {
    return this.getAllPaginated<VariedadTabaco>('/variedades-tabaco/');
  }

  // ==================== ETAPAS PRODUCTIVAS ====================

  async getEtapasProductivas(): Promise<PaginatedResponse<EtapaProductiva>> {
    const response = await fetch(`${this.baseUrl}/etapas-productivas/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<PaginatedResponse<EtapaProductiva>>(response);
  }

  async getEtapasActivas(): Promise<EtapaProductiva[]> {
    const response = await fetch(`${this.baseUrl}/etapas-productivas/activas/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<EtapaProductiva[]>(response);
  }

  // ==================== LOTES ====================

  async getLotes(params?: URLSearchParams): Promise<PaginatedResponse<Lote>> {
    const url = params ? `${this.baseUrl}/lotes/?${params}` : `${this.baseUrl}/lotes/`;
    const response = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<Lote>>(response);
  }

  async getAllLotes(params?: URLSearchParams): Promise<Lote[]> {
    return this.getAllPaginated<Lote>('/lotes/', params);
  }

  async getLote(id: number): Promise<Lote> {
    const response = await fetch(`${this.baseUrl}/lotes/${id}/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Lote>(response);
  }

  async createLote(data: Partial<Lote>): Promise<Lote> {
    const response = await fetch(`${this.baseUrl}/lotes/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Lote>(response);
  }

  async updateLote(id: number, data: Partial<Lote>): Promise<Lote> {
    const response = await fetch(`${this.baseUrl}/lotes/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Lote>(response);
  }

  async deleteLote(id: number): Promise<void> {
    await fetch(`${this.baseUrl}/lotes/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  async moverLoteEtapa(
    id: number,
    data: {
      etapa_destino: number;
      observaciones?: string;
      cantidad_procesada_kg?: number;
      incidencias?: string;
      motivo_retraso?: string;
      tiempo_trabajo_minutos?: number;
      tiempo_pausa_minutos?: number;
    }
  ): Promise<MovimientoLote> {
    const response = await fetch(`${this.baseUrl}/lotes/${id}/mover_etapa/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<MovimientoLote>(response);
  }

  async asignarResponsable(id: number, responsable_id: number): Promise<{ detail: string }> {
    const response = await fetch(`${this.baseUrl}/lotes/${id}/asignar_responsable/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ responsable_id }),
    });
    return this.handleResponse<{ detail: string }>(response);
  }

  async getTrazabilidad(id: number): Promise<Trazabilidad> {
    const response = await fetch(`${this.baseUrl}/lotes/${id}/trazabilidad/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Trazabilidad>(response);
  }

  async getEstadisticas(): Promise<Estadisticas> {
    const response = await fetch(`${this.baseUrl}/lotes/estadisticas/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Estadisticas>(response);
  }

  // ==================== MOVIMIENTOS ====================

  async getMovimientos(params?: URLSearchParams): Promise<PaginatedResponse<MovimientoLote>> {
    const url = params ? `${this.baseUrl}/movimientos/?${params}` : `${this.baseUrl}/movimientos/`;
    const response = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<MovimientoLote>>(response);
  }

  async createMovimiento(data: Partial<MovimientoLote>): Promise<MovimientoLote> {
    const response = await fetch(`${this.baseUrl}/movimientos/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<MovimientoLote>(response);
  }

  // ==================== INSPECCIONES DE CALIDAD ====================

  async getInspeccionesCalidad(params?: URLSearchParams): Promise<PaginatedResponse<InspeccionCalidad>> {
    const url = params ? `${this.baseUrl}/inspecciones-calidad/?${params}` : `${this.baseUrl}/inspecciones-calidad/`;
    const response = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<InspeccionCalidad>>(response);
  }

  async getInspeccionCalidad(id: number): Promise<InspeccionCalidad> {
    const response = await fetch(`${this.baseUrl}/inspecciones-calidad/${id}/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<InspeccionCalidad>(response);
  }

  async createInspeccionCalidad(data: Partial<InspeccionCalidad>): Promise<InspeccionCalidad> {
    const response = await fetch(`${this.baseUrl}/inspecciones-calidad/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<InspeccionCalidad>(response);
  }

  async updateInspeccionCalidad(id: number, data: Partial<InspeccionCalidad>): Promise<InspeccionCalidad> {
    const response = await fetch(`${this.baseUrl}/inspecciones-calidad/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<InspeccionCalidad>(response);
  }

  async getInspeccionesPendientes(): Promise<InspeccionCalidad[]> {
    const response = await fetch(`${this.baseUrl}/inspecciones-calidad/pendientes/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<InspeccionCalidad[]>(response);
  }

  // ==================== OBSERVACIONES ====================

  async getObservaciones(params?: URLSearchParams): Promise<PaginatedResponse<Observacion>> {
    const url = params ? `${this.baseUrl}/observaciones/?${params}` : `${this.baseUrl}/observaciones/`;
    const response = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<Observacion>>(response);
  }

  async createObservacion(data: Partial<Observacion>): Promise<Observacion> {
    const response = await fetch(`${this.baseUrl}/observaciones/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Observacion>(response);
  }

  // ==================== ALERTAS ====================

  async getAlertas(params?: URLSearchParams): Promise<PaginatedResponse<Alerta>> {
    const url = params ? `${this.baseUrl}/alertas/?${params}` : `${this.baseUrl}/alertas/`;
    const response = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<Alerta>>(response);
  }

  async getAllAlertas(params?: URLSearchParams): Promise<Alerta[]> {
    return this.getAllPaginated<Alerta>('/alertas/', params);
  }

  async getAlertasActivas(): Promise<Alerta[]> {
    const response = await fetch(`${this.baseUrl}/alertas/activas/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Alerta[]>(response);
  }

  async resolverAlerta(id: number): Promise<{ detail: string }> {
    const response = await fetch(`${this.baseUrl}/alertas/${id}/resolver/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ detail: string }>(response);
  }

  // ==================== EVENTOS DEL SISTEMA ====================

  async getEventosSistema(params?: URLSearchParams): Promise<PaginatedResponse<EventoSistema>> {
    const url = params ? `${this.baseUrl}/eventos-sistema/?${params}` : `${this.baseUrl}/eventos-sistema/`;
    const response = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<EventoSistema>>(response);
  }

  async getEventosRecientes(): Promise<EventoSistema[]> {
    const response = await fetch(`${this.baseUrl}/eventos-sistema/recientes/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<EventoSistema[]>(response);
  }

  // ==================== RECUPERACIÓN DE CONTRASEÑA ====================

  async requestResetPassword(identifier: string): Promise<{ detail: string }> {
    const response = await fetch(`${this.baseUrl}/auth/request_reset_password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    return this.handleResponse(response);
  }

  async verifyResetPasswordCode(identifier: string, code: string): Promise<{ valid: boolean }> {
    const response = await fetch(`${this.baseUrl}/auth/verify_reset_password_code/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, code }),
    });
    return this.handleResponse(response);
  }

  async resetPassword(identifier: string, code: string, newPassword: string): Promise<{ detail: string }> {
    const response = await fetch(`${this.baseUrl}/auth/reset_password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, code, new_password: newPassword }),
    });
    return this.handleResponse(response);
  }

  // ==================== NOTIFICACIONES ====================

  async getNotificaciones(params?: URLSearchParams): Promise<PaginatedResponse<NotificacionData>> {
    const url = params ? `${this.baseUrl}/notificaciones/?${params}` : `${this.baseUrl}/notificaciones/`;
    const response = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<NotificacionData>>(response);
  }

  async getAllNotificaciones(params?: URLSearchParams): Promise<NotificacionData[]> {
    return this.getAllPaginated<NotificacionData>('/notificaciones/', params);
  }

  async getNotificacionesNoLeidas(): Promise<NotificacionData[]> {
    const response = await fetch(`${this.baseUrl}/notificaciones/no_leidas/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<NotificacionData[]>(response);
  }

  async getContadorNoLeidas(): Promise<{ no_leidas: number }> {
    const response = await fetch(`${this.baseUrl}/notificaciones/contador/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ no_leidas: number }>(response);
  }

  async marcarNotificacionLeida(id: number): Promise<{ detail: string }> {
    const response = await fetch(`${this.baseUrl}/notificaciones/${id}/marcar_leida/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ detail: string }>(response);
  }

  async marcarTodasNotificacionesLeidas(): Promise<{ detail: string }> {
    const response = await fetch(`${this.baseUrl}/notificaciones/marcar_todas_leidas/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ detail: string }>(response);
  }

  // ==================== CONFIGURACIÓN ====================

  async getConfiguracion(params?: URLSearchParams): Promise<PaginatedResponse<ConfiguracionData>> {
    const url = params ? `${this.baseUrl}/configuracion/?${params}` : `${this.baseUrl}/configuracion/`;
    const response = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse<PaginatedResponse<ConfiguracionData>>(response);
  }

  async getConfiguracionPorClave(clave: string): Promise<ConfiguracionData> {
    const response = await fetch(`${this.baseUrl}/configuracion/por_clave/?clave=${encodeURIComponent(clave)}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<ConfiguracionData>(response);
  }

  async updateConfiguracion(id: number, data: Partial<ConfiguracionData>): Promise<ConfiguracionData> {
    const response = await fetch(`${this.baseUrl}/configuracion/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<ConfiguracionData>(response);
  }
}

// Exportar instancia singleton
export const api = new ApiService(API_BASE_URL);

// Exportar clase para testing o múltiples instancias
export default ApiService;
