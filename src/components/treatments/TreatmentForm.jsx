"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const TreatmentForm = ({ treatment, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (treatment) {
      setValue("name", treatment.name);
      setValue("description", treatment.description);
      setValue("duration", treatment.duration);
      setValue("price", treatment.price);
      setValue("status", treatment.status);
    }
  }, [treatment, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (treatment) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/treatments/${treatment.id}`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        toast({
          title: "Success",
          description: "Treatment updated successfully",
        });
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/treatments`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        toast({
          title: "Success",
          description: "Treatment created successfully",
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save treatment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {treatment ? "Edit Treatment" : "Add Treatment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Treatment Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Facial Treatment"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">
                {errors.name.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the treatment..."
              rows={4}
              {...register("description", {
                required: "Description is required",
              })}
            />
            {errors.description && (
              <span className="text-red-500 text-sm">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                placeholder="30"
                {...register("duration", {
                  required: "Duration is required",
                  min: { value: 15, message: "Minimum 15 minutes" },
                })}
              />
              {errors.duration && (
                <span className="text-red-500 text-sm">
                  {errors.duration.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="99.99"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
              />
              {errors.price && (
                <span className="text-red-500 text-sm">
                  {errors.price.message}
                </span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              onValueChange={(value) => setValue("status", value)}
              defaultValue={treatment?.status || "ACTIVE"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Treatment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TreatmentForm;
