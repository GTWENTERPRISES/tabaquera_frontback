"use client";

import { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { User, UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { scrollPositions } from "@/components/ScrollRestoration";

const baseUserSchema = z.object({
  firstName: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/, "Solo se permiten letras"),
  lastName: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/, "Solo se permiten letras"),
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "Solo letras, números, puntos, guiones y guion bajo"),
  email: z
    .string()
    .min(1, "El correo es requerido")
    .email("Ingresa un correo válido")
    .refine(
      (email) => !email.endsWith(".con"),
      "Dominio '.con' no es válido (¿quisiste decir '.com'?)",
    ),
  phone: z
    .string()
    .regex(/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos"),
  role: z.enum(["admin", "supervisor", "operator", "quality"], {
    errorMap: () => ({ message: "Selecciona un rol" }),
  }),
  department: z.enum(
    [
      "produccion",
      "calidad",
      "recepcion",
      "clasificacion",
      "seleccion",
      "empaque",
      "distribucion",
      "administracion",
    ],
    { errorMap: () => ({ message: "Selecciona un departamento" }) },
  ),
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "Selecciona un estado" }),
  }),
});

const passwordRules = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .refine((val) => /[A-Z]/.test(val), "Debe incluir al menos una letra mayúscula")
  .refine((val) => /[a-z]/.test(val), "Debe incluir al menos una letra minúscula")
  .refine((val) => /[0-9]/.test(val), "Debe incluir al menos un número")
  .refine((val) => /[^A-Za-z0-9]/.test(val), "Debe incluir al menos un carácter especial (@#$%...)");

// Al crear, la contraseña es obligatoria
const createUserSchema = baseUserSchema.extend({
  password: passwordRules,
});

// Al editar, la contraseña es opcional (vacía = no cambiar)
const editUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 0 || val.length >= 8,
      "Mínimo 8 caracteres",
    )
    .refine(
      (val) => !val || val.length === 0 || /[A-Z]/.test(val),
      "Debe incluir al menos una letra mayúscula",
    )
    .refine(
      (val) => !val || val.length === 0 || /[a-z]/.test(val),
      "Debe incluir al menos una letra minúscula",
    )
    .refine(
      (val) => !val || val.length === 0 || /[0-9]/.test(val),
      "Debe incluir al menos un número",
    )
    .refine(
      (val) => !val || val.length === 0 || /[^A-Za-z0-9]/.test(val),
      "Debe incluir al menos un carácter especial",
    ),
});

type UserFormValues = z.infer<typeof createUserSchema>;

interface UserFormProps {
  initialValues?: Partial<User>;
  submitLabel?: string;
}

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: "admin", label: "Administrador" },
  { value: "supervisor", label: "Supervisor" },
  { value: "operator", label: "Operario" },
  { value: "quality", label: "Control de Calidad" },
];

const departmentOptions: Array<{ value: string; label: string }> = [
  { value: "produccion", label: "Producción" },
  { value: "calidad", label: "Calidad" },
  { value: "recepcion", label: "Recepción" },
  { value: "clasificacion", label: "Clasificación" },
  { value: "seleccion", label: "Selección" },
  { value: "empaque", label: "Empaque" },
  { value: "distribucion", label: "Distribución" },
  { value: "administracion", label: "Administración" },
];

const isValidDepartment = (value: unknown): value is string => {
  return departmentOptions.some((opt) => opt.value === value);
};

const departmentLabelToValue: Record<string, string> = {
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
};

const departmentValueToLabel: Record<string, string> = {
  "produccion": "Producción",
  "calidad": "Calidad",
  "recepcion": "Recepción",
  "clasificacion": "Clasificación",
  "seleccion": "Selección",
  "empaque": "Empaque",
  "distribucion": "Distribución",
  "administracion": "Administración",
};

export function UserForm({
  initialValues,
  submitLabel = "Guardar Usuario",
}: UserFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const { addUser, updateUser } = useAuth();

  const handleCancel = () => {
    // Save scroll position before navigating back
    scrollPositions.set(currentUrl, window.scrollY);
    router.back();
  };

  const defaultValues = useMemo<UserFormValues>(() => {
    const fullName = initialValues?.name || "";
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    let department = "produccion";
    if (initialValues?.department) {
      if (isValidDepartment(initialValues.department)) {
        department = initialValues.department;
      } else if (departmentLabelToValue[initialValues.department]) {
        department = departmentLabelToValue[initialValues.department];
      }
    }

    const values: UserFormValues = {
      firstName,
      lastName,
      username: initialValues?.username ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      role: initialValues?.role ?? "operator",
      department,
      password: "",
      status:
        initialValues?.status ??
        (initialValues?.active === false ? "inactive" : "active"),
    };
    return values;
  }, [initialValues]);

  const isEditing = !!initialValues?.id;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEditing ? editUserSchema : createUserSchema),
    defaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: UserFormValues) => {
    try {
      const userData = {
        name: `${values.firstName} ${values.lastName}`,
        username: values.username,
        email: values.email,
        phone: values.phone,
        role: values.role,
        department: values.department,
        active: values.status === "active",
        status: values.status,
      };

      const userDataWithPassword =
        values.password && values.password.trim() !== ""
          ? { ...userData, password: values.password }
          : userData;

      if (initialValues?.id) {
        await updateUser(initialValues.id, userDataWithPassword);
        toast.success("Usuario actualizado correctamente");
      } else {
        await addUser(userDataWithPassword as typeof userData & { password: string });
        toast.success("Usuario creado correctamente");
      }

      router.push("/dashboard/usuarios");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Error al guardar el usuario");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input placeholder="Juan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellidos</FormLabel>
                <FormControl>
                  <Input placeholder="Perez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario</FormLabel>
                <FormControl>
                  <Input placeholder="juan.perez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="juan@goldenleaf.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono (10 dígitos)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0984324321"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    {...field}
                    onChange={(e) => {
                      // Strip any non-digit character in real time
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      field.onChange(digits);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar departamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departmentOptions.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {isEditing
                    ? "Nueva contraseña (opcional)"
                    : "Contraseña temporal *"}
                </FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Golden@2026" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
