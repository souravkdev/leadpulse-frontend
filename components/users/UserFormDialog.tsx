"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { User, UserRole } from "@/types/user";
import { ROLE_LABELS } from "@/types/user";

const createSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "sales_manager", "sales_agent", "viewer"]),
});

const editSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().optional(),
  role: z.enum(["admin", "sales_manager", "sales_agent", "viewer"]),
  is_active: z.boolean(),
});

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData = z.infer<typeof editSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

export function UserFormDialog({ open, onClose, user }: Props) {
  const isEdit = !!user;
  const qc = useQueryClient();

  const createUser = useMutation({
    mutationFn: (data: CreateFormData) =>
      api.post<User>("/users", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created");
      onClose();
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail ?? "Failed to create user");
    },
  });

  const updateUser = useMutation({
    mutationFn: (data: Partial<EditFormData>) =>
      api.put<User>(`/users/${user?.id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated");
      onClose();
    },
    onError: () => toast.error("Failed to update user"),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: { role: "sales_agent", is_active: true },
  });

  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          password: "",
        });
      } else {
        reset({ full_name: "", email: "", role: "sales_agent", is_active: true, password: "" });
      }
    }
  }, [open, user, reset]);

  async function onSubmit(data: EditFormData) {
    if (!isEdit && !data.password) {
      toast.error("Password is required");
      return;
    }
    const payload = { ...data, password: data.password || undefined };
    if (isEdit) {
      await updateUser.mutateAsync(payload);
    } else {
      await createUser.mutateAsync(payload as CreateFormData);
    }
  }

  const ROLES: UserRole[] = ["admin", "sales_manager", "sales_agent", "viewer"];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Invite User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Full Name *</Label>
            <Input placeholder="Jane Smith" {...register("full_name")} />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Email *</Label>
            <Input type="email" placeholder="jane@company.com" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>{isEdit ? "New Password (leave blank to keep)" : "Password *"}</Label>
            <Input
              type="password"
              placeholder={isEdit ? "Leave blank to keep current" : "Min 8 characters"}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Role</Label>
            <Select
              value={watch("role")}
              onValueChange={(v) => setValue("role", v as UserRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEdit && (
            <div className="flex items-center gap-2">
              <input
                id="is_active"
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                {...register("is_active")}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Account active
              </Label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
