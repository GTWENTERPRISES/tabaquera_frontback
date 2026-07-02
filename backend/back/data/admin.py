from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Usuario, Proveedor, VariedadTabaco, EtapaProductiva, Lote,
    MovimientoLote, InspeccionCalidad, EvidenciaCalidad,
    Observacion, Alerta, EventoSistema
)


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    """Admin para el modelo Usuario"""
    list_display = ['username', 'email', 'nombre_completo', 'rol', 'departamento', 'estado']
    list_filter = ['rol', 'departamento', 'estado', 'is_active']
    search_fields = ['username', 'email', 'nombres', 'apellidos']
    ordering = ['-fecha_creacion']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Información Personal', {
            'fields': ('nombres', 'apellidos', 'telefono')
        }),
        ('Información Laboral', {
            'fields': ('rol', 'departamento', 'estado')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Información Personal', {
            'fields': ('nombres', 'apellidos', 'email', 'telefono')
        }),
        ('Información Laboral', {
            'fields': ('rol', 'departamento', 'estado')
        }),
    )


@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    """Admin para el modelo Proveedor"""
    list_display = ['nombre', 'rfc', 'telefono', 'email', 'estado']
    list_filter = ['estado']
    search_fields = ['nombre', 'rfc', 'email']
    ordering = ['nombre']


@admin.register(VariedadTabaco)
class VariedadTabacoAdmin(admin.ModelAdmin):
    """Admin para el modelo VariedadTabaco"""
    list_display = ['nombre', 'activo']
    list_filter = ['activo']
    search_fields = ['nombre', 'descripcion']
    ordering = ['nombre']


@admin.register(EtapaProductiva)
class EtapaProductivaAdmin(admin.ModelAdmin):
    """Admin para el modelo EtapaProductiva"""
    list_display = ['orden', 'nombre', 'tiempo_esperado_horas', 'activa']
    list_filter = ['activa']
    search_fields = ['nombre']
    ordering = ['orden']


@admin.register(Lote)
class LoteAdmin(admin.ModelAdmin):
    """Admin para el modelo Lote"""
    list_display = [
        'codigo', 'proveedor', 'variedad', 'estado', 
        'etapa_actual', 'responsable_actual', 'fecha_ingreso'
    ]
    list_filter = ['estado', 'etapa_actual', 'proveedor', 'variedad']
    search_fields = ['codigo', 'proveedor__nombre', 'origen']
    ordering = ['-fecha_creacion']
    readonly_fields = ['codigo', 'codigo_qr', 'fecha_creacion', 'fecha_actualizacion']
    
    fieldsets = (
        ('Identificación', {
            'fields': ('codigo', 'codigo_qr')
        }),
        ('Información del Lote', {
            'fields': (
                'proveedor', 'variedad', 'origen', 
                'peso_inicial_kg', 'peso_actual_kg', 'cantidad_bultos'
            )
        }),
        ('Estado y Asignación', {
            'fields': (
                'estado', 'etapa_actual', 'responsable_actual'
            )
        }),
        ('Fechas', {
            'fields': (
                'fecha_ingreso', 'fecha_inicio_produccion', 
                'fecha_finalizacion', 'fecha_creacion', 'fecha_actualizacion'
            )
        }),
        ('Observaciones', {
            'fields': ('observaciones_iniciales',)
        }),
        ('Metadata', {
            'fields': ('creado_por',)
        }),
    )


@admin.register(MovimientoLote)
class MovimientoLoteAdmin(admin.ModelAdmin):
    """Admin para el modelo MovimientoLote"""
    list_display = [
        'lote', 'tipo_movimiento', 'etapa_origen', 
        'etapa_destino', 'usuario', 'fecha_hora'
    ]
    list_filter = ['tipo_movimiento', 'etapa_destino', 'incidencias', 'motivo_retraso']
    search_fields = ['lote__codigo', 'observaciones']
    ordering = ['-fecha_hora']
    readonly_fields = ['fecha_hora']


@admin.register(InspeccionCalidad)
class InspeccionCalidadAdmin(admin.ModelAdmin):
    """Admin para el modelo InspeccionCalidad"""
    list_display = [
        'lote', 'estado_calidad', 'grado_calidad',
        'inspector', 'etapa', 'fecha_hora_inicio'
    ]
    list_filter = ['estado_calidad', 'grado_calidad', 'decision', 'motivo_rechazo']
    search_fields = ['lote__codigo', 'observaciones']
    ordering = ['-fecha_hora_inicio']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion', 'duracion_minutos']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('lote', 'etapa', 'inspector', 'estado_calidad', 'grado_calidad')
        }),
        ('Mediciones', {
            'fields': ('temperatura', 'humedad', 'peso_kg')
        }),
        ('Checklist', {
            'fields': (
                'humedad_correcta', 'temperatura_correcta', 'peso_correcto',
                'embalaje_correcto', 'etiquetado_correcto', 'qr_legible', 'qr_verificado'
            )
        }),
        ('Decisión', {
            'fields': ('decision', 'motivo_rechazo', 'observaciones')
        }),
        ('Tiempos', {
            'fields': ('fecha_hora_inicio', 'fecha_hora_fin', 'duracion_minutos')
        }),
    )


@admin.register(EvidenciaCalidad)
class EvidenciaCalidadAdmin(admin.ModelAdmin):
    """Admin para el modelo EvidenciaCalidad"""
    list_display = ['inspeccion', 'tipo', 'descripcion', 'fecha_subida']
    list_filter = ['tipo']
    search_fields = ['descripcion', 'inspeccion__lote__codigo']
    ordering = ['-fecha_subida']
    readonly_fields = ['fecha_subida']


@admin.register(Observacion)
class ObservacionAdmin(admin.ModelAdmin):
    """Admin para el modelo Observacion"""
    list_display = ['lote', 'tipo', 'usuario', 'fecha_hora']
    list_filter = ['tipo']
    search_fields = ['lote__codigo', 'contenido']
    ordering = ['-fecha_hora']
    readonly_fields = ['fecha_hora']


@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    """Admin para el modelo Alerta"""
    list_display = [
        'titulo', 'tipo', 'severidad', 'estado',
        'lote', 'etapa', 'fecha_creacion'
    ]
    list_filter = ['tipo', 'severidad', 'estado']
    search_fields = ['titulo', 'descripcion', 'lote__codigo']
    ordering = ['-fecha_creacion']
    readonly_fields = ['fecha_creacion']


@admin.register(EventoSistema)
class EventoSistemaAdmin(admin.ModelAdmin):
    """Admin para el modelo EventoSistema"""
    list_display = ['tipo', 'usuario', 'lote', 'fecha_hora', 'ip_address']
    list_filter = ['tipo']
    search_fields = ['descripcion', 'usuario__username', 'lote__codigo']
    ordering = ['-fecha_hora']
    readonly_fields = ['fecha_hora']
