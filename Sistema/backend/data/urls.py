from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthViewSet, UsuarioViewSet, ProveedorViewSet, VariedadTabacoViewSet,
    EtapaProductivaViewSet, LoteViewSet, MovimientoLoteViewSet,
    InspeccionCalidadViewSet, ObservacionViewSet, AlertaViewSet,
    EventoSistemaViewSet, SessionViewSet, NotificacionViewSet,
    ConfiguracionSistemaViewSet
)

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'usuarios', UsuarioViewSet)
router.register(r'proveedores', ProveedorViewSet)
router.register(r'variedades-tabaco', VariedadTabacoViewSet)
router.register(r'etapas-productivas', EtapaProductivaViewSet)
router.register(r'lotes', LoteViewSet)
router.register(r'movimientos', MovimientoLoteViewSet)
router.register(r'inspecciones-calidad', InspeccionCalidadViewSet)
router.register(r'observaciones', ObservacionViewSet)
router.register(r'alertas', AlertaViewSet)
router.register(r'eventos-sistema', EventoSistemaViewSet)
router.register(r'sesiones', SessionViewSet, basename='sesiones')
router.register(r'notificaciones', NotificacionViewSet, basename='notificaciones')
router.register(r'configuracion', ConfiguracionSistemaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
