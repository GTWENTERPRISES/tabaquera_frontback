from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es Administrador
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.rol == 'administrador'
        )


class IsSupervisorUser(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es Supervisor o Administrador
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.rol in ['supervisor', 'administrador']
        )


class IsOperarioUser(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es Operario, Supervisor o Administrador
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.rol in ['operario', 'supervisor', 'administrador']
        )


class IsCalidadUser(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es de Control de Calidad
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.rol in ['control_calidad', 'administrador']
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso para que solo el propietario pueda editar
    """
    def has_object_permission(self, request, view, obj):
        # Los métodos GET, HEAD, OPTIONS son permitidos para todos
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Los métodos de escritura solo para el propietario
        return obj.usuario == request.user or request.user.rol == 'administrador'


class CanCreateLote(permissions.BasePermission):
    """
    Permiso para crear lotes (solo Administrador y Supervisor)
    """
    def has_permission(self, request, view):
        if request.method == 'POST':
            return (
                request.user and 
                request.user.is_authenticated and 
                request.user.rol in ['administrador', 'supervisor']
            )
        return True


class CanUpdateLote(permissions.BasePermission):
    """
    Permiso para actualizar lotes (solo Administrador y Supervisor)
    """
    def has_permission(self, request, view):
        if request.method in ['PUT', 'PATCH']:
            return (
                request.user and 
                request.user.is_authenticated and 
                request.user.rol in ['administrador', 'supervisor']
            )
        return True


class CanDeleteLote(permissions.BasePermission):
    """
    Permiso para eliminar lotes (solo Administrador)
    """
    def has_permission(self, request, view):
        if request.method == 'DELETE':
            return (
                request.user and 
                request.user.is_authenticated and 
                request.user.rol == 'administrador'
            )
        return True
