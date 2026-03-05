"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Camera, Loader2, User2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateUserProfile } from "@/actions/auth";

interface AccountSectionProps {
  profile: {
    name: string | null;
    username: string | null;
    email: string;
    image: string | null;
  };
  onRefresh: () => void;
}

export function AccountSection({ profile, onRefresh }: AccountSectionProps) {
  const { update: updateSession } = useSession();
  const [name, setName] = useState(profile.name ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = (profile.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  async function handleSave() {
    setSaving(true);
    try {
      const result = await updateUserProfile({ name: name.trim(), username: username.trim() });
      if (result.error) {
        toast.error(result.error);
      } else {
        await updateSession({ name: name.trim() });
        toast.success("Profile updated");
        onRefresh();
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }

      const result = await updateUserProfile({ image: data.url });
      if (result.error) {
        toast.error(result.error);
      } else {
        await updateSession({ image: data.url });
        toast.success("Photo updated");
        onRefresh();
      }
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const hasChanges = name.trim() !== (profile.name ?? "") || username.trim() !== (profile.username ?? "");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User2 className="h-4 w-4" />
          Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.image ?? undefined} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Click the camera icon to change your photo
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="profile-name">Display Name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="profile-username">Username</Label>
          <Input
            id="profile-username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            placeholder="your-username"
            maxLength={30}
          />
          <p className="text-xs text-muted-foreground">
            3-30 characters, letters, numbers, _ or -
          </p>
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={profile.email} disabled className="bg-muted" />
        </div>

        {/* Save */}
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
